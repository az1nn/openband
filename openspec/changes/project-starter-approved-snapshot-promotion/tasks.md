# Tasks: Project Starter — Approved Snapshot Promotion

## P0: Snapshot + approval model
- [ ] Define immutable `GeneratedStarterSnapshot` (revision, recipe, seed, version, contentHash, uri, approved:false) in `src/lib/projectStarter.ts` (or a dedicated `snapshotPromotion` module).
- [ ] Define `ApprovedStarterSnapshot` (+ approvalToken, approvedAt); non-stale relative to session config.
- [ ] Implement `normalizedRecipe`/content-hash reuse from seeded-variations (exclude transient IDs/blob URLs) (R3).
- [ ] Implement `computeStale(sessionConfig, snapshot)` (R4).

## P1: Promotion core
- [ ] Implement `promoteStarterSnapshot(session, snapshot)` — exact promotion, no regeneration (R3).
- [ ] Add approval-token idempotency gate; coalesce duplicate/rapid Create calls (R5).
- [ ] R4 gate: if config changed since approval, promote last explicitly approved snapshot + surface explicit notice (no silent mix) (R4).
- [ ] Integrate `NewProject.tsx` Create button with approved-snapshot boundary; full numBars from recipe, not live UI.

## P2: Ephemeral cleanup
- [ ] On promotion/close/cancel/session replacement: stop playback, revoke preview blob URLs, drop history (R6).
- [ ] Ensure no ProjectStore/Supabase write unless promotion succeeded and was sole approved Create (R6, acceptance scenario 4).

## Verification
- [ ] `npx tsc --noEmit` — 0 errors.
- [ ] `cd backend && npx tsc --noEmit` — 0 errors.
- [ ] `npx vitest run` — green.
- [ ] `npm run test:legacy` — 24/24.
- [ ] `npm run graph:ci` — 0 errors.
- [ ] Acceptance scenarios from `test-plan.md` pass.

## Status: PROPOSED
