import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { validateMarketingKb } from '../scripts/marketing-kb-check.mjs';

async function createFixture(overrides = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'openband-marketing-kb-'));
  const dir = path.join(root, 'docs', 'marketing');
  await fs.mkdir(dir, { recursive: true });

  const files = {
    'source-registry.md': `# Sources

### S-001 — Canonical source

- Grade: A
- Linked research: R-001.
`,
    'research-register.md': `# Research

## Research ledger

| ID | Question | State | Evidence |
| --- | --- | --- | --- |
| R-001 | Does the workflow create value? | HYPOTHESIS | See S-001. |
`,
    'decision-log.md': `# Decisions

### MD-001 — Keep the promise narrow

**Status:** ACTIVE
**Evidence:** R-001; S-001.
`,
    'experiments.md': `# Experiments

### EXP-001 — Workflow proof

**Status:** BACKLOG
**Research:** R-001
`,
    'README.md': `# Marketing

See [research](./research-register.md#research-ledger), MD-001 and EXP-001.
`,
    ...overrides,
  };

  await Promise.all(
    Object.entries(files).map(([name, content]) => fs.writeFile(path.join(dir, name), content, 'utf8')),
  );

  return root;
}

test('accepts a consistent knowledge base', async (t) => {
  const root = await createFixture();
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const result = await validateMarketingKb(root);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.stats, {
    files: 5,
    sources: 1,
    research: 1,
    decisions: 1,
    experiments: 1,
  });
});

test('reports unresolved IDs, invalid states, duplicate IDs, and broken links', async (t) => {
  const root = await createFixture({
    'decision-log.md': `# Decisions

### MD-001 — First definition

**Status:** CURRENT
**Evidence:** R-999.

### MD-001 — Duplicate definition

**Status:** ACTIVE
`,
    'README.md': `# Marketing

See [missing](./missing.md), MD-001 and EXP-001.
`,
  });
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const result = await validateMarketingKb(root);
  const codes = new Set(result.errors.map((error) => error.code));

  assert.ok(codes.has('DUPLICATE_ID'));
  assert.ok(codes.has('INVALID_STATE'));
  assert.ok(codes.has('UNRESOLVED_ID'));
  assert.ok(codes.has('BROKEN_LINK'));
});

test('reports missing required state, invalid source grade, and broken anchors', async (t) => {
  const root = await createFixture({
    'source-registry.md': `# Sources

### S-001 — Canonical source

- Grade: Z
- Linked research: R-001.
`,
    'experiments.md': `# Experiments

### EXP-001 — Workflow proof

**Research:** R-001
`,
    'README.md': `# Marketing

See [bad anchor](./research-register.md#does-not-exist), MD-001 and EXP-001.
`,
  });
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const result = await validateMarketingKb(root);
  const codes = new Set(result.errors.map((error) => error.code));

  assert.ok(codes.has('INVALID_SOURCE_GRADE'));
  assert.ok(codes.has('MISSING_STATE'));
  assert.ok(codes.has('BROKEN_ANCHOR'));
});
