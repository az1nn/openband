import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

describe("SIGA repository-local orchestration policy", () => {
  it("keeps one canonical SIGA and one delegation-only compatibility entrypoint", () => {
    const canonical = read(".agents/skills/openband-session-router/SKILL.md");
    const compat = read(".qwen/skills/auto-skill-session-router/SKILL.md");

    assert.match(canonical, /canonical SIGA/i);
    assert.match(canonical, /RESUME/);
    assert.match(canonical, /WATCH/);
    assert.match(canonical, /ADVANCE/);
    assert.match(compat, /\.agents\/skills\/openband-session-router\/SKILL\.md/);

    for (const duplicate of [".siga/SKILL.md", "SIGA.md", "skills/siga/SKILL.md"]) {
      assert.equal(fs.existsSync(path.join(root, duplicate)), false, `duplicate canonical SIGA path: ${duplicate}`);
    }
  });

  it("locks authority ordering and the five-stage core loop", () => {
    const core = read("docs/ai/siga-orchestration.md");
    assert.match(core, /REAL STATE > REPOSITORY HANDOFF > MEMORY > CHAT/);
    for (const stage of ["RECONCILE", "DECIDE", "EXECUTE", "VERIFY", "PERSIST"]) {
      assert.match(core, new RegExp(`\\b${stage}\\b`));
    }
    for (const classification of ["RESUME", "WATCH", "ADVANCE"]) {
      assert.match(core, new RegExp(`\\b${classification}\\b`));
    }
  });

  it("uses a repository-local manifest with explicit adapters and no standalone state store", () => {
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
    assert.equal(fs.existsSync(path.join(root, "maestri")), false);
    assert.equal(fs.existsSync(path.join(root, ".maestri")), false);
  });

  it("defines deterministic idempotency, WATCH and error handling", () => {
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
