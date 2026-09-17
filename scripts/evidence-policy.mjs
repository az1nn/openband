export const CANONICAL_REPO = "az1nn/openband";
export const TIER_RANK = Object.freeze({ T0: 0, T1: 1, T2: 2, T3: 3, T4: 4 });
export const MANDATORY_CI_JOBS = Object.freeze([
  "graph-check",
  "security-policy",
  "frontend-typecheck",
  "backend-typecheck",
  "vitest",
  "legacy-tests",
  "web-build",
  "web-launch-e2e",
  "merge-gate",
]);

const TRUST_ROOT_EXACT = new Set([
  ".specify/memory/constitution.md",
  "AGENTS.md",
  "scripts/ci-merge-gate.mjs",
  "scripts/evidence-policy.mjs",
  "scripts/privileged-evidence-merge.mjs",
  "scripts/sdd-policy-check.mjs",
  "scripts/security-policy-check.mjs",
]);

export function maxTier(...tiers) {
  return tiers.flat().filter((tier) => tier in TIER_RANK).sort((a, b) => TIER_RANK[b] - TIER_RANK[a])[0] || "T0";
}

export function isTrustRootPath(file) {
  return file.startsWith(".github/workflows/") || TRUST_ROOT_EXACT.has(file);
}

export function deriveMinimumTier(paths = []) {
  let tier = "T0";
  const triggers = new Set();
  for (const file of paths) {
    const normalized = file.replaceAll("\\", "/");
    if (isTrustRootPath(normalized)) {
      tier = maxTier(tier, "T4");
      triggers.add("trust-root-change");
      continue;
    }
    if (/(^|\/)(auth|security|crypto|permissions|rbac|secrets?)(\/|\.|-)/i.test(normalized)) {
      tier = maxTier(tier, "T4");
      triggers.add("security-sensitive-path");
      continue;
    }
    if (/(crdt|concurren|corrupt|recovery|rollback)/i.test(normalized)) {
      tier = maxTier(tier, "T4");
      triggers.add("integrity-concurrency-path");
      continue;
    }
    if (/^(android|electron)\//.test(normalized) || /(persistence|storage|sqlite|database|bridge|native)/i.test(normalized)) {
      tier = maxTier(tier, "T3");
      triggers.add("architecture-runtime-path");
    }
  }
  return { tier, triggers: [...triggers] };
}

export function parseDesignGate(body = "") {
  if (!body.includes("<!-- openband-design-gate -->") || !body.includes("OPENBAND DESIGN GATE v1")) return null;
  const fields = {};
  for (const raw of body.split(/\r?\n/)) {
    const match = /^([A-Z_]+):\s*(.+?)\s*$/.exec(raw.trim());
    if (match) fields[match[1]] = match[2];
  }
  if (!fields.BASELINE_SHA || !fields.TIER || !fields.DECISION || !fields.ISSUE) return null;
  return {
    baselineSha: fields.BASELINE_SHA,
    tier: fields.TIER.toUpperCase(),
    decision: fields.DECISION.toUpperCase(),
    issue: Number(fields.ISSUE),
    requiredCiJobs: (fields.REQUIRED_CI_JOBS || "").split(",").map((x) => x.trim()).filter(Boolean),
    riskTriggers: (fields.RISK_TRIGGERS || "").split(",").map((x) => x.trim()).filter(Boolean),
    scope: fields.SCOPE || "",
  };
}

export function selectApprovedDesignGate(comments = [], issue, ownerLogin) {
  const gates = comments
    .filter((comment) => !ownerLogin || comment.user?.login === ownerLogin)
    .map((comment) => ({ comment, gate: parseDesignGate(comment.body || "") }))
    .filter(({ gate }) => gate && gate.issue === issue && gate.decision === "APPROVED" && gate.tier in TIER_RANK);
  return gates.length ? gates[gates.length - 1] : null;
}

export function validateFeatureMetadata(metadata) {
  const errors = [];
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return ["metadata must be an object"];
  if (![1, 2].includes(metadata.schemaVersion)) errors.push("schemaVersion must be 1 or 2");
  if (!(metadata.tier in TIER_RANK)) errors.push("invalid tier");
  if (!Number.isInteger(metadata.issue) || metadata.issue < 1) errors.push("issue must be a positive integer");
  if (metadata.schemaVersion === 2 && TIER_RANK[metadata.tier] >= TIER_RANK.T2) {
    if (!/^[0-9a-f]{40}$/i.test(metadata.designBaselineSha || "")) errors.push("T2+ schema v2 requires designBaselineSha");
    if (!Array.isArray(metadata.requiredChecks) || metadata.requiredChecks.length === 0) errors.push("T2+ schema v2 requires non-empty requiredChecks");
    else if (metadata.requiredChecks.some((x) => typeof x !== "string" || !x.trim())) errors.push("requiredChecks must contain non-empty strings");
  }
  return errors;
}

export function requiredEvidence({ metadataList = [], gate, changedPaths = [], labels = [], effectiveTier, riskTriggers = [] }) {
  const ci = new Set(MANDATORY_CI_JOBS);
  for (const metadata of metadataList) for (const name of metadata.requiredChecks || []) ci.add(name);
  for (const name of gate?.requiredCiJobs || []) ci.add(name);

  const labelSet = new Set(labels);
  if (labelSet.has("native-build") || changedPaths.some((p) => p.startsWith("android/"))) ci.add("android-build");
  if (labelSet.has("native-build") || changedPaths.some((p) => p.startsWith("electron/"))) ci.add("electron-build");

  const trusted = new Set();
  if (effectiveTier === "T4") trusted.add("t4-evidence");
  if (riskTriggers.some((trigger) => /security|trust-root|repository-write/i.test(trigger))) trusted.add("openband-security");
  return { ci: [...ci].sort(), trusted: [...trusted].sort() };
}

export function evaluateMerge(input) {
  const reasons = [];
  const changedPaths = input.changedPaths || [];
  const labels = input.labels || [];
  const metadataList = input.metadataList || [];
  const declaredTier = maxTier(metadataList.map((m) => m.tier), labels.map((l) => /^tier:(T[0-4])$/i.exec(l)?.[1]?.toUpperCase()).filter(Boolean));
  const derived = deriveMinimumTier(changedPaths);
  const effectiveTier = maxTier(declaredTier, derived.tier);
  const riskTriggers = [...new Set([...derived.triggers, ...metadataList.flatMap((m) => m.riskTriggers || []), ...(input.gate?.riskTriggers || [])])];

  if (input.headRepo !== CANONICAL_REPO) reasons.push(`untrusted head repository ${input.headRepo || "missing"}`);
  if (input.prState !== "open") reasons.push(`PR state is ${input.prState}`);
  if (input.draft) reasons.push("PR is draft");
  if (input.baseRef !== "master") reasons.push(`base is ${input.baseRef}`);
  if (!input.headSha || input.headSha !== input.runHeadSha) reasons.push("CI HEAD is stale");
  if (!input.currentBaseSha || !["ahead", "identical"].includes(input.baseComparisonStatus)) reasons.push("candidate is not based on current master");
  if (input.mergeable === false || ["dirty", "blocked"].includes(input.mergeableState)) reasons.push(`mergeable_state=${input.mergeableState}`);
  if (metadataList.length === 0 && TIER_RANK[effectiveTier] >= TIER_RANK.T2) reasons.push("T2+ requires feature metadata");
  for (const metadata of metadataList) for (const error of validateFeatureMetadata(metadata)) reasons.push(`metadata issue ${metadata.issue || "?"}: ${error}`);
  if (TIER_RANK[declaredTier] < TIER_RANK[derived.tier]) reasons.push(`declared tier ${declaredTier} is below path-derived minimum ${derived.tier}`);

  const topMetadata = metadataList.sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier])[0];
  if (TIER_RANK[effectiveTier] >= TIER_RANK.T2) {
    if (!input.gate) reasons.push("approved Design Gate missing");
    else {
      if (TIER_RANK[input.gate.tier] < TIER_RANK[effectiveTier]) reasons.push(`Design Gate tier ${input.gate.tier} below effective tier ${effectiveTier}`);
      if (!topMetadata || input.gate.issue !== topMetadata.issue) reasons.push("Design Gate issue does not match highest-risk feature metadata");
      if (!topMetadata || input.gate.baselineSha !== topMetadata.designBaselineSha) reasons.push("Design Gate baseline does not match feature metadata");
      if (!["ahead", "identical"].includes(input.baselineComparisonStatus)) reasons.push("approved Design Baseline is not an ancestor of current HEAD");
    }
  }

  const required = requiredEvidence({ metadataList, gate: input.gate, changedPaths, labels, effectiveTier, riskTriggers });
  for (const name of required.ci) if (input.jobState?.[name] !== "success") reasons.push(`${name}=${input.jobState?.[name] || "missing"}`);
  for (const name of required.trusted) if (input.trustedEvidence?.[name] !== "success") reasons.push(`${name}=${input.trustedEvidence?.[name] || "missing"}`);
  if ((input.blockingReviewers || []).length) reasons.push(`active request changes from ${(input.blockingReviewers || []).join(", ")}`);

  return { status: reasons.length ? "BLOCKED" : "SATISFIED", reasons, declaredTier, derivedTier: derived.tier, effectiveTier, riskTriggers, required };
}

export function auditPrivilegedWorkflow(content = "") {
  const findings = [];
  if (!/workflow_run\s*:/.test(content)) findings.push("privileged merger must use workflow_run");
  if (/pull_request_target\s*:/.test(content)) findings.push("pull_request_target is forbidden for privileged merger");
  if (!/ref:\s*master\b/.test(content)) findings.push("trusted checkout must pin ref: master");
  if (!/persist-credentials:\s*false\b/.test(content)) findings.push("trusted checkout must disable persisted credentials");
  if (/ref:\s*\$\{\{[^\n]*(head_sha|head\.sha)/i.test(content)) findings.push("candidate HEAD checkout is forbidden in privileged workflow");
  if (!/node scripts\/privileged-evidence-merge\.mjs/.test(content)) findings.push("privileged workflow must execute default-branch evaluator script");
  if (!/checks:\s*write/.test(content)) findings.push("trusted evidence producer requires checks: write");
  if (!/contents:\s*write/.test(content) || !/pull-requests:\s*write/.test(content)) findings.push("merge workflow requires explicit repository merge permissions");
  return findings;
}

export function auditCiWorkflow(content = "") {
  const findings = [];
  if (/contents:\s*write|pull-requests:\s*write|checks:\s*write|actions:\s*write/.test(content)) findings.push("PR CI must not have repository-write permissions");
  for (const job of MANDATORY_CI_JOBS) if (!new RegExp(`\\n  ${job.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}:`).test(content)) findings.push(`missing mandatory CI job ${job}`);
  return findings;
}
