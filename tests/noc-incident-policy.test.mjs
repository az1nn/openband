import fs from "node:fs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

const skill = read(".agents/skills/openband-noc/SKILL.md");
const policy = read("docs/operations/incident-response.md");
const runbook = read("docs/operations/runbooks/api-regression.md");

describe("NOC incident-response safety boundary", () => {
  it("keeps production-changing actions human-authorized", () => {
    for (const source of [skill, policy, runbook]) {
      assert.equal(source.toLowerCase().includes("explicit human approval"), true);
    }

    for (const required of [
      "rollback",
      "redeploy",
      "rotate credentials",
      "access controls",
      "production data",
    ]) {
      assert.equal(
        (skill + "\n" + policy).toLowerCase().includes(required),
        true,
        `missing production boundary for ${required}`,
      );
    }
  });

  it("keeps facts, hypotheses and recommendations separate", () => {
    for (const required of ["Observed facts", "Hypotheses", "Recommended next action", "Verification"]) {
      assert.equal(
        (skill + "\n" + runbook).includes(required),
        true,
        `missing incident output anchor ${required}`,
      );
    }
  });

  it("fails closed on uncertain or unhealthy evidence", () => {
    const evidence = (skill + "\n" + policy).toLowerCase();
    for (const required of ["fail", "blocked", "flaky", "stale", "missing"]) {
      assert.equal(evidence.includes(required), true, `missing evidence state ${required}`);
    }
    assert.equal(skill.toLowerCase().includes("missing evidence remains unknown"), true);
  });

  it("delegates engineering and security work to canonical specialists", () => {
    assert.equal(skill.includes("openband-ask"), true);
    assert.equal(skill.includes("openband-security"), true);
    assert.equal(policy.includes("openband-ask"), true);
    assert.equal(policy.includes("openband-security"), true);
    assert.equal(skill.includes("Never create a second engineering lifecycle or merge gate"), true);
  });

  it("contains a bounded simulated API regression without granting mutation authority", () => {
    for (const required of [
      "Simulated example",
      "fictional",
      "POST /api/projects",
      "SEV-2",
      "explicit human approval",
    ]) {
      assert.equal(runbook.includes(required), true, `missing runbook anchor ${required}`);
    }
  });
});
