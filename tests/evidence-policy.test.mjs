import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  auditCiWorkflow,
  auditPrivilegedWorkflow,
  deriveMinimumTier,
  evaluateMerge,
  parseDesignGate,
  requiredEvidence,
} from "../scripts/evidence-policy.mjs";

const gate = {
  baselineSha: "2e1a3cea840172031c425cd7dd316e0d23690590",
  tier: "T4",
  decision: "APPROVED",
  issue: 81,
  requiredCiJobs: ["graph-check", "merge-gate"],
  riskTriggers: ["repository-write-automation"],
};
const metadata = {
  schemaVersion: 2,
  tier: "T4",
  issue: 81,
  riskTriggers: ["repository-write-automation"],
  dependsOn: [],
  designBaselineSha: gate.baselineSha,
  requiredChecks: ["graph-check", "security-policy", "frontend-typecheck", "backend-typecheck", "vitest", "legacy-tests", "web-build", "web-launch-e2e", "merge-gate"],
};
const allJobs = Object.fromEntries(metadata.requiredChecks.map((name) => [name, "success"]));

function base(overrides = {}) {
  return {
    headRepo: "az1nn/openband",
    prState: "open",
    draft: false,
    baseRef: "master",
    headSha: "a".repeat(40),
    runHeadSha: "a".repeat(40),
    currentBaseSha: "b".repeat(40),
    baseComparisonStatus: "ahead",
    mergeable: true,
    mergeableState: "clean",
    changedPaths: [".github/workflows/evidence-merge.yml", "scripts/privileged-evidence-merge.mjs"],
    labels: [],
    metadataList: [structuredClone(metadata)],
    gate: structuredClone(gate),
    baselineComparisonStatus: "ahead",
    jobState: { ...allJobs },
    trustedEvidence: { "openband-security": "success", "t4-evidence": "success" },
    blockingReviewers: [],
    ...overrides,
  };
}

describe("evidence-driven merge trust policy", () => {
  it("forces merge trust-root changes to T4", () => {
    assert.equal(deriveMinimumTier([".github/workflows/evidence-merge.yml"]).tier, "T4");
    assert.equal(deriveMinimumTier(["electron/main.js"]).tier, "T3");
  });

  it("parses GitHub-native Design Gate evidence", () => {
    const parsed = parseDesignGate(`<!-- openband-design-gate -->\nOPENBAND DESIGN GATE v1\nBASELINE_SHA: ${gate.baselineSha}\nTIER: T4\nDECISION: APPROVED\nISSUE: 81\nREQUIRED_CI_JOBS: graph-check,merge-gate\n`);
    assert.equal(parsed.baselineSha, gate.baselineSha);
    assert.deepEqual(parsed.requiredCiJobs, ["graph-check", "merge-gate"]);
  });

  it("blocks fork heads", () => {
    const result = evaluateMerge(base({ headRepo: "attacker/openband" }));
    assert.equal(result.status, "BLOCKED");
    assert.ok(result.reasons.some((reason) => reason.includes("untrusted head repository")));
  });

  it("blocks tier downgrade on trust-root changes", () => {
    const lowered = structuredClone(metadata);
    lowered.tier = "T3";
    const result = evaluateMerge(base({ metadataList: [lowered] }));
    assert.ok(result.reasons.some((reason) => reason.includes("below path-derived minimum T4")));
  });

  it("blocks stale exact HEAD and stale base", () => {
    const result = evaluateMerge(base({ runHeadSha: "c".repeat(40), baseComparisonStatus: "behind" }));
    assert.ok(result.reasons.includes("CI HEAD is stale"));
    assert.ok(result.reasons.includes("candidate is not based on current master"));
  });

  it("blocks missing Design Gate and missing trusted T4 evidence", () => {
    const result = evaluateMerge(base({ gate: null, trustedEvidence: {} }));
    assert.ok(result.reasons.includes("approved Design Gate missing"));
    assert.ok(result.reasons.some((reason) => reason.startsWith("t4-evidence=")));
    assert.ok(result.reasons.some((reason) => reason.startsWith("openband-security=")));
  });

  it("unions feature and Design Gate CI evidence", () => {
    const required = requiredEvidence({ metadataList: [metadata], gate, changedPaths: ["android/app/build.gradle"], effectiveTier: "T4", riskTriggers: gate.riskTriggers });
    assert.ok(required.ci.includes("android-build"));
    assert.ok(required.trusted.includes("t4-evidence"));
  });

  it("satisfies only with exact-head, fresh-base, gate-bound and trusted evidence", () => {
    const result = evaluateMerge(base());
    assert.equal(result.status, "SATISFIED");
  });

  it("audits privileged workflow against candidate checkout", () => {
    const safe = `on:\n  workflow_run:\npermissions:\n  checks: write\n  contents: write\n  pull-requests: write\nsteps:\n  - uses: actions/checkout@v4\n    with:\n      ref: master\n      persist-credentials: false\n  - run: node scripts/privileged-evidence-merge.mjs\n`;
    assert.deepEqual(auditPrivilegedWorkflow(safe), []);
    assert.ok(auditPrivilegedWorkflow(safe.replace("ref: master", "ref: ${{ github.event.workflow_run.head_sha }}")).length > 0);
  });

  it("rejects write permissions in PR CI", () => {
    const jobs = metadata.requiredChecks.map((name) => `\n  ${name}:\n    runs-on: ubuntu-latest`).join("");
    assert.deepEqual(auditCiWorkflow(`permissions:\n  contents: read\njobs:${jobs}`), []);
    assert.ok(auditCiWorkflow(`permissions:\n  contents: write\njobs:${jobs}`).length > 0);
  });
});
