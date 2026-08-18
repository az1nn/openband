# Tasks: V9-01 — Project Starter Live Preview

## 1. P0: Audio Safety & Gain Normalization
- [ ] Implement `normalizeVolumeGain` in `src/lib/projectPreview.ts` and apply to `src/lib/midiSynth.ts` line 844.
- [ ] Normalize bus and master gains in `renderTracksToUrl`.

## 2. P1: `src/lib/projectPreview.ts`
- [ ] Create `src/lib/projectPreview.ts` with `normalizeVolumeGain`, `calculateEffectivePreviewBars`, `computePreviewFingerprint`, `generatePreviewTracks`.
- [ ] Add unit tests in `tests/projectPreview.test.ts`.

## 3. P2: `src/hooks/useProjectPreview.ts`
- [ ] Create `useProjectPreview` hook with state machine (`idle`, `rendering`, `ready`, `playing`, `paused`, `error`), debounce, latest-only queue, stale revision discard, and unmount cleanup.
- [ ] Add concurrency and leak tests in `tests/useProjectPreview.test.ts`.

## 4. P3: `ProjectPreviewPlayer` & `NewProject` Integration
- [ ] Create `src/components/ProjectPreviewPlayer.tsx`.
- [ ] Wire `useProjectPreview` and `ProjectPreviewPlayer` into `src/components/NewProject.tsx` details step.
- [ ] Add component tests in `tests/components/ProjectPreviewPlayer.test.tsx` and `tests/newProjectPreview.test.tsx`.

## 5. P4: Create Boundary Reentrancy & Fallback
- [ ] Add reentrancy guard in `NewProject.tsx` `handleCreate`.
- [ ] Wire fallback "Criar sem prévia" on preview error.

## 6. Verification
- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] `cd backend && npx tsc --noEmit` passes with 0 errors.
- [ ] `npx vitest run` passes with 100% green.
- [ ] `npm run test:legacy` passes (24/24).
- [ ] `npm run graph:ci` passes with 0 errors.
- [ ] `npm run build` succeeds.
