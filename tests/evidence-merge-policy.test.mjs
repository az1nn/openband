import fs from "node:fs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

describe("privileged evidence merge trust boundary", () => {
  it("does not execute candidate code or artifacts in the privileged workflow", () => {
    const workflow = read(".github/workflows/evidence-merge.yml");
    for (const forbidden of ["actions/" + "checkout", "download-" + "artifact", "pull_request" + "_target"]) {
      assert.equal(workflow.includes(forbidden), false, `privileged workflow must not contain ${forbidden}`);
    }
    for (const required of [
      "openband-security:",
      "t4-evidence:",
      "merge:",
      "pr.head.repo.full_name",
      "heads/master",
      "openband-design-gate",
      "REQUIRED_CI_JOBS",
      "RISK_TRIGGERS",
      "contents: write",
      "pull-requests: write",
    ]) {
      assert.equal(workflow.includes(required), true, `missing ${required}`);
    }
  });

  it("materializes the approved T4 evidence contract", () => {
    const metadata = JSON.parse(read("specs/20260917-142100-evidence-driven-merge/openband.json"));
    assert.equal(metadata.schemaVersion, 2);
    assert.equal(metadata.tier, "T4");
    assert.equal(Array.isArray(metadata.requiredChecks), true);
    assert.equal(metadata.requiredChecks.length > 0, true);
    assert.equal(metadata.riskTriggers.includes("security-sensitive-privileged-workflow"), true);
  });

  it("keeps an actionable kill-switch and recovery path", () => {
    const recovery = read("docs/operations/merge-automation-recovery.md").toLowerCase();
    for (const required of ["disable", "revert", "audit", "re-enable"]) {
      assert.equal(recovery.includes(required), true, `missing recovery step ${required}`);
    }
  });
});
