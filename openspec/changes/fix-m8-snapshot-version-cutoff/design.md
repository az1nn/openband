# Design — M8: SnapshotManager Version/Cutoff Mismatch

## Type change (`src/lib/snapshotManager.ts`)
Add a dedicated cutoff to `SnapshotData`:

```ts
export interface SnapshotData {
  id: string;
  projectId: string;
  state: Record<string, unknown>;
  operationCount: number;
  version: number;            // sequence number (unchanged)
  maxIncludedTimestamp: number; // NEW: max Lamport timestamp baked into `state`
  createdAt: number;
}
```

## Population
`createSnapshot(...)` must compute `maxIncludedTimestamp` from the max Lamport
timestamp of the operations that produced `state` (e.g., accept it as a parameter or
derive from the applied op log it replays). Default `0` if unknown.

## Fix (`compactOperations`, line 113)
```ts
// before
return operations.filter((op) => op.timestamp > snapshot.version);
// after
return operations.filter((op) => op.timestamp > (snapshot.maxIncludedTimestamp ?? 0));
```

The `?? 0` guard is required: existing/old snapshots may not yet carry the new field, and
`op.timestamp > undefined` evaluates to `false` for every op, which would drop the entire
log. Defaulting to `0` keeps pre-existing snapshots compacting correctly (all ops
timestamped > 0 are kept).

`version` retains its sequence-number meaning; no change to `getLatestSnapshot` /
`getSnapshotHistory` consumers.

## Callers / tests
- `tests/lib4.test.ts` (uses `compactOperations`) and `tests/specs-group1.test.ts`
  call `createSnapshot` — update those calls to pass `maxIncludedTimestamp`.
- `tests/regression-round2-state.test.ts` uses `mergeSnapshotIntoState` only (unaffected).
