# Tasks: Modulation Unipolar Symmetric Range

> **Status: PROPOSED.** Low-priority correctness fix.

## Phase 1 — Spec (done)

- [x] `openspec/changes/modulation-unipolar-symmetric/proposal.md`
- [x] `openspec/changes/modulation-unipolar-symmetric/design.md`
- [x] `openspec/changes/modulation-unipolar-symmetric/tasks.md`
- [x] Commit spec files only (implementation not yet staged).

## Phase 2 — Implement

### A. Fix `computeModulation` unipolar branch

- [ ] Read `src/lib/modulationMatrix.ts` lines 326-330 (computeModulation).
- [ ] Change line 329 `else` branch from:
      `total += (sourceValue * 0.5 + 0.5) * route.amount;`
      to:
      `total += sourceValue * route.amount;`
- [ ] Verify bipolar branch (line 327) is unchanged.
- [ ] Verify `getModSources` / `getModTargets` still return 11 entries.

### B. Update test encoding buggy behavior

- [ ] `tests/modulationMatrix.test.ts` line 57 ("offsets a base value into [min, max]"):
  - [ ] Add `setMacroValue` to the import list.
  - [ ] Insert `setMacroValue(0, 1);` before the `addModRoute` call so macro1=1
        produces a meaningful positive offset (result still clamps to 24).

## Phase 3 — Verify

1. [ ] `node ./node_modules/typescript/bin/tsc --noEmit` -- zero errors.
2. [ ] `npx vitest run tests/modulation.test.ts tests/modulationMatrix.test.ts tests/modulationMatrixRender.test.ts` -- all pass.
3. [ ] Confirm no stray `.studio-id-tmp.tsx` staged.

## Phase 4 — Leave uncommitted

- Do NOT commit the implementation. Spec commit only.
