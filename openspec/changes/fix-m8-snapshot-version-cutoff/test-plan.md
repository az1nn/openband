# Test Plan — M8: SnapshotManager Version/Cutoff Mismatch

## Unit under test
- `compactOperations(snapshot, operations)` and `createSnapshot` in
  `src/lib/snapshotManager.ts`.

## Cases
1. **Cutoff independence** — create snapshot `version=3` (sequence) but
   `maxIncludedTimestamp=5`, `state` produced by replaying ops timestamped 1..5.
   Compact over ops 1..10 → assert exactly ops 6..10 remain (the old `> version`
   filter would have wrongly kept/dropped based on `version=3`).
2. **Monotonic** — for snapshots with increasing `version`, assert each compacted log
   contains no `op.timestamp <= its maxIncludedTimestamp`.
3. **Edge** — `maxIncludedTimestamp=50` drops all ops with timestamp ≤ 50.
4. **Sequence semantics unchanged** — `getLatestSnapshot().version` and
   `getSnapshotHistory` still reflect the sequence number (updated test calls pass the
   new field without altering version assertions).

## Non-regression
- `regression-round2-state.test.ts` (`mergeSnapshotIntoState`) unaffected.
- No `src/`/`app/` production consumer exists for `compactOperations`.
