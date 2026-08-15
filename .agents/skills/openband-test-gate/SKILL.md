---
name: openband-test-gate
description: Run the minimal OpenBand validation matrix (tsc, vitest, legacy node:test, graph:ci, build) for a change area.
---

# OpenBand Test Gate

You determine and run the minimal validation matrix for the area a change touched, then report PASS/FAIL per gate. Only declare done on green.

## Process

1. Identify the change area from `git diff --cached` / `git diff`.
2. Run the gates below that apply.

### Gate selection

- **Any `app/` + `src/` TypeScript change** →
  - `wsl -e bash -lc "cd /home/az1nn/openband && npx tsc --noEmit"` (zero errors required)
  - `wsl -e bash -lc "cd /home/az1nn/openband && npx vitest run <affected test files>"` for the relevant `tests/` files.
- **`backend/src/` change** →
  - `wsl -e bash -lc "cd /home/az1nn/openband/backend && npx tsc --noEmit"` (zero errors required).
- **Any change** →
  - `wsl -e bash -lc "cd /home/az1nn/openband && npm run test:legacy"` (legacy node:test suite).
  - `wsl -e bash -lc "cd /home/az1nn/openband && npm run graph:ci"` (graph validation gate).
- **UI changes** (optional but recommended) →
  - `wsl -e bash -lc "cd /home/az1nn/openband && npm run build"`.

### Important execution note

- **vitest cannot run from the Windows UNC mount.** Always invoke it through WSL: `wsl -e bash -lc "cd /home/az1nn/openband && npx vitest run <files>"`. Never run `npx vitest` directly from the `\\wsl.localhost\...` UNC path.
- Similarly route `tsc`, `test:legacy`, `graph:ci`, and `build` through `wsl -e bash -lc` to avoid path/mount issues.

## Output

For each gate report:

- Gate name
- Command run
- `PASS` or `FAIL` (with the relevant error excerpt on FAIL)

Only declare **DONE (green)** when every applicable gate passes. Read-only — never edit files.
