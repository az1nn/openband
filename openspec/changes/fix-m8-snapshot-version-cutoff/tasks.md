# Tasks — M8: SnapshotManager Version/Cutoff Mismatch

- [ ] **T1** In `src/lib/snapshotManager.ts`, add `maxIncludedTimestamp: number` to `SnapshotData`.
- [ ] **T2** Update `createSnapshot` to populate `maxIncludedTimestamp` (parameter or derived from max applied op timestamp; default `0`).
- [ ] **T3** Change `compactOperations` line 113 to filter on `op.timestamp > snapshot.maxIncludedTimestamp`.
- [ ] **T4** Update existing test calls in `tests/lib4.test.ts` and `tests/specs-group1.test.ts` `createSnapshot(...)` invocations to pass `maxIncludedTimestamp`.
- [ ] **T5** Add a vitest case: snapshot `version=3` (sequence) but `maxIncludedTimestamp=5`, state from replaying ops timestamped 1..5; `compactOperations` over ops 1..10 → only 6..10 remain (proves cutoff is independent of `version`).
- [ ] **T6** Add monotonicity case: snapshots with increasing `version` each compact to a log containing no `op.timestamp <= its maxIncludedTimestamp`; edge `maxIncludedTimestamp=50` drops up to 50.
- [ ] **T7** Run `npx tsc --noEmit` (frontend) — zero errors.
- [ ] **T8** Run `npx vitest run tests/lib4.test.ts tests/specs-group1.test.ts` plus the new assertions — all pass.
- [ ] **T9** Run `npm run graph:ci` — 0 errors.
