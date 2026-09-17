import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { checkFeature, checkRepository } from "../scripts/sdd-policy-check.mjs";

const roots = [];
function tmpRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "openband-governance-"));
  roots.push(root);
  return root;
}
function write(root, rel, content) {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe("OpenBand live merge governance", () => {
  it("rejects stale mandatory human merge semantics", () => {
    const root = tmpRoot();
    write(root, "AGENTS.md", "HUMAN DESIGN GATE\nHUMAN MERGE GATE\n");
    const errors = checkRepository(root);
    assert.equal(errors.some((error) => error.includes("stale merge semantics")), true);
  });

  it("accepts evidence-driven exact-HEAD merge semantics", () => {
    const root = tmpRoot();
    write(root, "AGENTS.md", "HUMAN DESIGN GATE\nEVIDENCE-DRIVEN MERGE GATE\nThe gate evaluates the exact merge-candidate HEAD.\n");
    write(root, ".specify/memory/constitution.md", "Merge authorization is evidence-driven for the exact candidate HEAD.\n");
    write(root, "docs/ai/session-handoff-template.md", "Merge Gate: `NOT_REQUIRED | PENDING | SATISFIED | BLOCKED | INVALIDATED`\n");
    assert.deepEqual(checkRepository(root), []);
  });

  it("requires non-empty requiredChecks for schemaVersion 2 T2+", () => {
    const root = tmpRoot();
    const dir = path.join(root, "specs", "feature");
    write(root, "specs/feature/openband.json", JSON.stringify({
      schemaVersion: 2,
      tier: "T2",
      issue: 1,
      riskTriggers: [],
      dependsOn: [],
    }));
    for (const file of ["spec.md", "plan.md", "tasks.md"]) write(root, "specs/feature/" + file, "");
    const errors = checkFeature(root, dir);
    assert.equal(errors.some((error) => error.includes("schemaVersion 2 T2+ requires non-empty requiredChecks")), true);
  });

  it("accepts a T4 schemaVersion 2 evidence contract with adversarial recovery planning", () => {
    const root = tmpRoot();
    const dir = path.join(root, "specs", "feature");
    write(root, "specs/feature/openband.json", JSON.stringify({
      schemaVersion: 2,
      tier: "T4",
      issue: 1,
      riskTriggers: ["security-sensitive-test"],
      dependsOn: [],
      requiredChecks: ["graph-check", "security-policy"],
    }));
    write(root, "specs/feature/spec.md", "");
    write(root, "specs/feature/tasks.md", "");
    write(root, "specs/feature/plan.md", "ADR: NOT REQUIRED\nAdversarial verification is required.\nRecovery and rollback are documented.\n");
    assert.deepEqual(checkFeature(root, dir), []);
  });
});
