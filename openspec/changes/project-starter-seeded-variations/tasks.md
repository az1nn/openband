# Tasks: Project Starter — Seeded Variations and Locks

## P0: Deterministic generation primitives
- [ ] Create the `seededVariations` module (versioned `GenerationRecipe` + `GenerationLocks`).
- [ ] Implement `createSeededPRNG` (deterministic; no ambient `Math.random()` in variation path).
- [ ] Implement `normalizedRecipe()` (strips transient IDs/blob URLs/revision).
- [ ] Implement per-dimension `dimensionHash` (rhythm, bass, harmony, melody, fx).

## P1: Variation + lock invariants
- [ ] Implement `computeVariationSnapshot(recipe, locks)` → new seed + new revision (R3).
- [ ] Thread RNG dependency through generation paths (R8).
- [ ] Implement lock carry-forward from selected snapshot.
- [ ] Implement lock compatibility validation on genre/subgenre/key changes (R6); explicit incompatibility state.
- [ ] Verify locked dimensions produce identical dimension hashes across variations (R5).

## P2: History budget + eviction
- [ ] Add bounded A/B history (3 default, 5 max); protect selected snapshot (R7).
- [ ] Implement eviction + resource cleanup (revoke blob URLs, stop playback) on eviction/recipe change/close.

## P3: UI
- [ ] Add Regenerate, lock toggles, and A/B history selector to `ProjectPreviewPlayer` (v9-01).
- [ ] Hide seed/variation label by default; expose in diagnostics.

## Verification
- [ ] `npx tsc --noEmit` — 0 errors.
- [ ] `cd backend && npx tsc --noEmit` — 0 errors.
- [ ] `npx vitest run` — green.
- [ ] `npm run test:legacy` — 24/24.
- [ ] `npm run graph:ci` — 0 errors.
- [ ] Acceptance scenarios from `test-plan.md` pass.

## Status: PROPOSED
