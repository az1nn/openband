# Tasks: Project Starter — Arrangement-aware Preview

## P0: Data model + selection
- [ ] Define `PreviewWindow` model (section, startBar, barCount, energy).
- [ ] Define `PreviewBudget` (maxBars ≤ MAX_PREVIEW_BARS).
- [ ] Implement `selectRepresentativeWindows(arrangement, budget, locks)`:
  energy-diverse selection, lock-aware.

## P1: Generation path wiring
- [ ] Wire `arrangementGenerator` metadata into the Project Starter context.
- [ ] Expose optional subgenre/arrangement selection when compatible options exist (R1).
- [ ] Add manual section picker (R4).
- [ ] Render selected windows through the existing render/playback pipeline.
- [ ] Cache only bounded current/history windows.

## P2: Budget + fallback
- [ ] Enforce preview budget on every regeneration; never render full long arrangement (R5).
- [ ] Add fallback to short-loop preview when no arrangement metadata (R6).
- [ ] Dispose old URLs/resources on window/recipe change.

## P3: Snapshot integration
- [ ] Add arrangement metadata + selected windows to snapshot/recipe metadata (R7), alongside seeded-variations locks.

## Verification
- [ ] `npx tsc --noEmit` — 0 errors.
- [ ] `cd backend && npx tsc --noEmit` — 0 errors.
- [ ] `npx vitest run` — green.
- [ ] `npm run test:legacy` — 24/24.
- [ ] `npm run graph:ci` — 0 errors.
- [ ] Acceptance scenarios from `test-plan.md` pass.

## Status: PROPOSED
