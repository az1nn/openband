import fs from "node:fs";
import {
  CANONICAL_REPO,
  TIER_RANK,
  auditCiWorkflow,
  auditPrivilegedWorkflow,
  evaluateMerge,
  maxTier,
  selectApprovedDesignGate,
} from "./evidence-policy.mjs";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const eventPath = process.env.GITHUB_EVENT_PATH;
if (!token || !repository || !eventPath) throw new Error("GITHUB_TOKEN, GITHUB_REPOSITORY and GITHUB_EVENT_PATH are required");
if (repository !== CANONICAL_REPO) throw new Error(`refusing privileged execution outside ${CANONICAL_REPO}`);

const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
const run = event.workflow_run;
if (!run || run.event !== "pull_request") {
  console.log("No pull_request workflow_run to evaluate.");
  process.exit(0);
}
if (run.conclusion !== "success") {
  console.log(`CI run ${run.id} concluded ${run.conclusion}; Merge Gate remains blocked.`);
  process.exit(0);
}

const [owner, repo] = repository.split("/");
const api = "https://api.github.com";

async function request(pathname, { method = "GET", body } = {}) {
  const response = await fetch(`${api}${pathname}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "openband-evidence-merge",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${method} ${pathname}: ${response.status} ${await response.text()}`);
  if (response.status === 204) return null;
  return response.json();
}

async function paginate(pathname) {
  const rows = [];
  for (let page = 1; ; page += 1) {
    const separator = pathname.includes("?") ? "&" : "?";
    const batch = await request(`${pathname}${separator}per_page=100&page=${page}`);
    const items = Array.isArray(batch) ? batch : batch.jobs || batch.check_runs || [];
    rows.push(...items);
    if (items.length < 100) return rows;
  }
}

async function getContent(path, ref) {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const data = await request(`/repos/${owner}/${repo}/contents/${encoded}?ref=${encodeURIComponent(ref)}`);
  if (Array.isArray(data) || data.type !== "file") throw new Error(`expected file content for ${path}@${ref}`);
  return Buffer.from(data.content, data.encoding || "base64").toString("utf8");
}

async function compare(base, head) {
  return request(`/repos/${owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`);
}

async function publishCheck(name, headSha, conclusion, summary, details = "") {
  await request(`/repos/${owner}/${repo}/check-runs`, {
    method: "POST",
    body: {
      name,
      head_sha: headSha,
      status: "completed",
      conclusion,
      output: {
        title: `${name}: ${conclusion.toUpperCase()}`,
        summary: summary.slice(0, 65000),
        text: details.slice(0, 65000),
      },
    },
  });
}

function patchSecurityFindings(files) {
  const findings = [];
  const patterns = [
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key material"],
    [/\bsk-proj-[A-Za-z0-9_-]{20,}\b/, "OpenAI project key"],
    [/\bghp_[A-Za-z0-9]{30,}\b/, "GitHub personal access token"],
    [/\bgithub_pat_[A-Za-z0-9_]{30,}\b/, "GitHub fine-grained token"],
    [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key"],
  ];
  for (const file of files) {
    const patch = file.patch || "";
    for (const [pattern, label] of patterns) if (pattern.test(patch)) findings.push(`${file.filename}: possible ${label}`);
  }
  return findings;
}

function auditPrivilegedScript(content) {
  const findings = [];
  for (const pattern of [/node:child_process/, /\beval\s*\(/, /new\s+Function\s*\(/, /\bexec(?:File|Sync)?\s*\(/, /\bspawn(?:Sync)?\s*\(/]) {
    if (pattern.test(content)) findings.push(`privileged evaluator contains forbidden execution primitive ${pattern}`);
  }
  if (!content.includes('CANONICAL_REPO')) findings.push("privileged evaluator must bind canonical repository");
  if (!content.includes("evaluateMerge")) findings.push("privileged evaluator must use shared evidence policy");
  if (!content.includes("sha: pr.head.sha")) findings.push("merge request must bind exact PR HEAD SHA");
  if (!content.includes("openband-security") || !content.includes("t4-evidence")) findings.push("trusted evidence producers are missing");
  return findings;
}

function auditPurePolicy(content) {
  const findings = [];
  for (const pattern of [/node:child_process/, /node:fs/, /node:https/, /\bfetch\s*\(/, /process\.env\.GITHUB_TOKEN/, /\beval\s*\(/, /new\s+Function\s*\(/]) {
    if (pattern.test(content)) findings.push(`evidence policy must remain pure; found ${pattern}`);
  }
  if (!content.includes('CANONICAL_REPO = "az1nn/openband"')) findings.push("canonical repository constant is missing");
  if (!content.includes("deriveMinimumTier") || !content.includes("parseDesignGate")) findings.push("tier/gate trust primitives are missing");
  return findings;
}

const associated = run.pull_requests || [];
if (associated.length !== 1) throw new Error(`expected exactly one PR for run ${run.id}, got ${associated.length}`);
const pullNumber = associated[0].number;
const pr = await request(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
if (pr.state !== "open") {
  console.log(`PR #${pullNumber} is not open; nothing to merge.`);
  process.exit(0);
}

const files = await paginate(`/repos/${owner}/${repo}/pulls/${pullNumber}/files`);
const changedPaths = files.map((file) => file.filename);
const labels = pr.labels.map((label) => label.name);
const metadataList = [];
for (const file of files.filter((file) => file.status !== "removed" && /^specs\/[^/]+\/openband\.json$/.test(file.filename))) {
  metadataList.push(JSON.parse(await getContent(file.filename, pr.head.sha)));
}

const declaredTier = maxTier(metadataList.map((m) => m.tier), labels.map((label) => /^tier:(T[0-4])$/i.exec(label)?.[1]?.toUpperCase()).filter(Boolean));
const highestMetadata = metadataList.slice().sort((a, b) => (TIER_RANK[b.tier] || 0) - (TIER_RANK[a.tier] || 0))[0];
const comments = await paginate(`/repos/${owner}/${repo}/issues/${pullNumber}/comments`);
const gateRecord = highestMetadata && TIER_RANK[declaredTier] >= TIER_RANK.T2
  ? selectApprovedDesignGate(comments, highestMetadata.issue, owner)
  : null;
const gate = gateRecord?.gate || null;

const currentMaster = await request(`/repos/${owner}/${repo}/branches/master`);
const baseComparison = await compare(currentMaster.commit.sha, pr.head.sha);
const baselineComparison = gate ? await compare(gate.baselineSha, pr.head.sha) : null;
const jobs = await paginate(`/repos/${owner}/${repo}/actions/runs/${run.id}/jobs`);
const jobState = Object.fromEntries(jobs.map((job) => [job.name, job.conclusion]));
const reviews = await paginate(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`);
const latestByReviewer = new Map();
for (const review of reviews) if (review.user?.login) latestByReviewer.set(review.user.login, review.state);
const blockingReviewers = [...latestByReviewer.entries()].filter(([, state]) => state === "CHANGES_REQUESTED").map(([login]) => login);

const securityFindings = patchSecurityFindings(files);
try {
  securityFindings.push(...auditCiWorkflow(await getContent(".github/workflows/ci.yml", pr.head.sha)));
  securityFindings.push(...auditPrivilegedWorkflow(await getContent(".github/workflows/evidence-merge.yml", pr.head.sha)));
  securityFindings.push(...auditPrivilegedScript(await getContent("scripts/privileged-evidence-merge.mjs", pr.head.sha)));
  securityFindings.push(...auditPurePolicy(await getContent("scripts/evidence-policy.mjs", pr.head.sha)));
} catch (error) {
  securityFindings.push(`trust-root audit failed: ${error.message}`);
}
if (pr.head.repo?.full_name !== CANONICAL_REPO) securityFindings.push(`fork/untrusted head repository ${pr.head.repo?.full_name || "missing"}`);

const securityConclusion = securityFindings.length ? "failure" : "success";
await publishCheck(
  "openband-security",
  pr.head.sha,
  securityConclusion,
  securityFindings.length ? `Trusted security audit blocked: ${securityFindings.join("; ")}` : "Trusted default-branch security audit passed without executing candidate code.",
  `workflow_run=${run.id}; evaluator_ref=master; candidate=${pr.head.sha}`
);

const t4Findings = [];
if (gate === null && TIER_RANK[declaredTier] >= TIER_RANK.T2) t4Findings.push("approved Design Gate record missing");
if (gate && highestMetadata?.designBaselineSha !== gate.baselineSha) t4Findings.push("feature metadata baseline does not match approved Design Gate");
if (gate && !["ahead", "identical"].includes(baselineComparison?.status)) t4Findings.push("approved baseline is not an ancestor of current HEAD");
if (gate) {
  const declaredChecks = new Set(highestMetadata?.requiredChecks || []);
  for (const name of gate.requiredCiJobs) if (!declaredChecks.has(name)) t4Findings.push(`feature requiredChecks omits Design Gate job ${name}`);
}
try {
  const recovery = await getContent("docs/operations/evidence-merge-recovery.md", pr.head.sha);
  for (const word of ["disable", "revert", "audit", "re-enable"]) if (!recovery.toLowerCase().includes(word)) t4Findings.push(`recovery runbook missing '${word}' step`);
  const tests = await getContent("tests/evidence-policy.test.mjs", pr.head.sha);
  for (const phrase of ["fork heads", "tier downgrade", "stale exact HEAD", "missing Design Gate", "candidate checkout", "write permissions"]) {
    if (!tests.includes(phrase)) t4Findings.push(`adversarial fixture missing '${phrase}' case`);
  }
} catch (error) {
  t4Findings.push(`T4 evidence audit failed: ${error.message}`);
}
if (securityConclusion !== "success") t4Findings.push("openband-security trusted audit did not pass");

const t4Conclusion = t4Findings.length ? "failure" : "success";
await publishCheck(
  "t4-evidence",
  pr.head.sha,
  t4Conclusion,
  t4Findings.length ? `T4 evidence blocked: ${t4Findings.join("; ")}` : "T4 adversarial, Design Gate, trust-root and recovery evidence satisfied by trusted default-branch evaluator.",
  `workflow_run=${run.id}; baseline=${gate?.baselineSha || "none"}; candidate=${pr.head.sha}`
);

const result = evaluateMerge({
  headRepo: pr.head.repo?.full_name,
  prState: pr.state,
  draft: pr.draft,
  baseRef: pr.base.ref,
  headSha: pr.head.sha,
  runHeadSha: run.head_sha,
  currentBaseSha: currentMaster.commit.sha,
  baseComparisonStatus: baseComparison.status,
  mergeable: pr.mergeable,
  mergeableState: pr.mergeable_state,
  changedPaths,
  labels,
  metadataList,
  gate,
  baselineComparisonStatus: baselineComparison?.status,
  jobState,
  trustedEvidence: {
    "openband-security": securityConclusion,
    "t4-evidence": t4Conclusion,
  },
  blockingReviewers,
});

console.log(JSON.stringify(result, null, 2));
if (pr.draft) {
  console.log(`PR #${pullNumber} is draft; evidence was evaluated but merge execution is intentionally paused.`);
  process.exit(0);
}
if (result.status !== "SATISFIED") {
  throw new Error(`Merge Gate BLOCKED: ${result.reasons.join("; ")}`);
}

const merged = await request(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
  method: "PUT",
  body: { sha: pr.head.sha, merge_method: "squash" },
});
if (!merged.merged) throw new Error(`GitHub refused merge: ${merged.message}`);
console.log(`Merge Gate SATISFIED: merged PR #${pullNumber} at exact HEAD ${pr.head.sha}; merge commit ${merged.sha}`);
