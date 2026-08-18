# Design: Documentation Sync After Round-2 Hardening

## Files to Modify

### 1. `README.md`
- L21: `Vitest (1479 tests)` → `Vitest (1650 tests)`.
- `Scripts` section (L371–391): ensure `npm run tsc`, `npx tsc --noEmit`, `npx vitest run`,
  `npm run test:legacy`, `npm run graph:ci`, `npm run build` are all listed.
- Add a `## Verification` block near the scripts section listing the six-step matrix, noting
  commands must run inside WSL: `wsl -e bash -lc "cd /home/az1nn/openband && <cmd>"`.
- Scope the Playwright/E2E mention as optional (no invented run command).

### 2. `AGENTS.md`
- Know Issues verification matrix (L322–330): keep order; add a bullet noting the 5
  `regression-round2-*` suites, `tests/futureRoadmap.test.ts` converted to vitest, and
  `tests/backend-routes.test.ts` excluded from vitest (node:test script).
- Architecture "Full suite totals" line (`1479 vitest tests + 24 legacy ... across 83 test files`):
  replace `1479` → `1650`, recompute the actual test-file count via glob and update `83` to the
  real number, keep legacy `24`.

### 3. `docs/features-analysis.md`
- L14, L161: `1479` → `1650`; correct `83 files` reference to the actual vitest test-file count.

### 4. `docs/testing-mocks.md`
- L189: update stale `1479` / `83` test-count references to current values.

### 5. `docs/HY3-HANDOFF.md`
- L12, L33, L176: update stale `1479` test-count references to `1650`.

### 6. `ROADMAP.md`
- Add a top-of-file note: "Superseded by docs/roadmap.md — most checklist items shipped."
  (No item rewrites; just a redirect header.)

### 7. `docs/features-implementation.md`
- Under the existing hardening section, add one line referencing commit `0f3a45b` and the
  regression suites (`tests/regression-round2-*.test.ts`). Non-blocking.

## Test-File Count Reconciliation
Run from WSL: `ls tests/*.test.ts tests/**/*.test.ts 2>/dev/null | wc -l` to get the real
vitest test-file count and use it wherever `83 test files` appears.

## Verification (post-edit)
- `grep -rn "1479" README.md AGENTS.md docs/features-analysis.md docs/testing-mocks.md docs/HY3-HANDOFF.md`
  must return **no matches**.
- No TypeScript/build impact (docs-only).
