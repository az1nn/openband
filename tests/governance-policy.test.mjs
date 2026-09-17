import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { checkRepository } from "../scripts/sdd-policy-check.mjs";

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
    write(
      root,
      "AGENTS.md",
      "HUMAN DESIGN GATE\nEVIDENCE-DRIVEN MERGE GATE\nThe gate evaluates the exact merge-candidate HEAD.\n"
    );
    write(
      root,
      ".specify/memory/constitution.md",
      "Merge authorization is evidence-driven for the exact candidate HEAD.\n"
    );
    write(
      root,
      "docs/ai/session-handoff-template.md",
      "Merge Gate: `NOT_REQUIRED | PENDING | SATISFIED | BLOCKED | INVALIDATED`\n"
    );
    assert.deepEqual(checkRepository(root), []);
  });
});
