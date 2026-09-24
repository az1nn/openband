import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
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
    write(root, "AGENTS.md", "AUTOMATED DESIGN VALIDATION\nHUMAN MERGE GATE\n");
    const errors = checkRepository(root);
    assert.equal(errors.some((error) => error.includes("stale merge semantics")), true);
  });

  it("accepts evidence-driven exact-HEAD merge semantics", () => {
    const root = tmpRoot();
    write(root, "AGENTS.md", "AUTOMATED DESIGN VALIDATION\nEVIDENCE-DRIVEN MERGE GATE\nThe gate evaluates the exact merge-candidate HEAD.\n");
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


describe("SIGA repository-local orchestration policy", () => {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8");

  it("keeps one canonical SIGA and a delegation-only compatibility entrypoint", () => {
    const canonical = read(".agents/skills/openband-session-router/SKILL.md");
    const compat = read(".qwen/skills/auto-skill-session-router/SKILL.md");

    assert.match(canonical, /canonical SIGA/i);
    for (const classification of ["RESUME", "WATCH", "ADVANCE"]) {
      assert.match(canonical, new RegExp(`\\b${classification}\\b`));
    }
    assert.match(compat, /\.agents\/skills\/openband-session-router\/SKILL\.md/);

    for (const duplicate of [".siga/SKILL.md", "SIGA.md", "skills/siga/SKILL.md"]) {
      assert.equal(fs.existsSync(path.join(repoRoot, duplicate)), false, `duplicate canonical SIGA path: ${duplicate}`);
    }
  });

  it("preserves real-state authority and the portable five-stage loop", () => {
    const core = read("docs/ai/siga-orchestration.md");
    assert.match(core, /REAL STATE > REPOSITORY HANDOFF > MEMORY > CHAT/);
    for (const stage of ["RECONCILE", "DECIDE", "EXECUTE", "VERIFY", "PERSIST"]) {
      assert.match(core, new RegExp(`\\b${stage}\\b`));
    }
    for (const classification of ["RESUME", "WATCH", "ADVANCE"]) {
      assert.match(core, new RegExp(`\\b${classification}\\b`));
    }
  });

  it("requires explicit local capabilities, adapters and derived-only checkpoint state", () => {
    const manifest = JSON.parse(read("docs/ai/siga-capabilities.json"));
    assert.equal(manifest.siga.protocol, 1);
    assert.equal(manifest.siga.architecture, "repository-local");
    assert.equal(manifest.siga.stateScope, "repository");
    assert.equal(manifest.siga.authority, "derived");
    assert.equal(manifest.siga.canonicalSkill, ".agents/skills/openband-session-router/SKILL.md");
    assert.equal(manifest.checkpoint.standalone_mutable_store, false);

    for (const [capability, enabled] of Object.entries(manifest.capabilities)) {
      assert.equal(typeof enabled, "boolean", `${capability} must be boolean`);
      if (enabled) assert.equal(typeof manifest.adapters[capability], "string", `${capability} needs a local adapter`);
    }

    assert.equal(manifest.capabilities.concurrency, true);
    assert.equal(manifest.adapters.concurrency, "github-pr-issue-session-lease");
    assert.equal(fs.existsSync(path.join(repoRoot, "maestri")), false);
    assert.equal(fs.existsSync(path.join(repoRoot, ".maestri")), false);
  });

  it("defines idempotency, WATCH taxonomy and deterministic error classes", () => {
    const core = read("docs/ai/siga-orchestration.md");
    for (const token of ["ensure branch", "ensure worktree", "ensure PR", "ensure lease", "ensure handoff"]) {
      assert.match(core, new RegExp(token, "i"));
    }
    for (const error of ["TRANSIENT", "CONFLICT", "BLOCKED", "HUMAN_REQUIRED", "PERMANENT"]) {
      assert.match(core, new RegExp(`\\b${error}\\b`));
    }
    for (const watch of ["CI_PENDING", "REVIEW_PENDING", "DEPLOY_PENDING", "HUMAN_APPROVAL", "EXTERNAL_SERVICE", "DEPENDENCY_PENDING"]) {
      assert.match(core, new RegExp(`\\b${watch}\\b`));
    }
  });
});
