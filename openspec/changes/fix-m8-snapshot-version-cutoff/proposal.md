# Proposal — M8: SnapshotManager Version/Cutoff Mismatch

## Context
`src/lib/snapshotManager.ts:113` (`compactOperations`):

```ts
return operations.filter((op) => op.timestamp > snapshot.version);
```

`op.timestamp` is a **CRDT Lamport clock** value (`crdt.ts`: `localClock++`;
`timestamp: localClock`). `SnapshotData.version` is a **snapshot sequence number**,
not a Lamport cutoff. Evidence: tests pass arbitrary counters as `version`
(`createSnapshot("proj-x", {tracks:[]}, 3, 5)` → `version=5` is unrelated to the
Lamport timestamps baked into `snapshot.state`).

The two values live in different coordinate systems — this is the version mismatch.

## Problem (latent — no production caller)
- If `version` V < true baked Lamport cutoff L: `op.timestamp > V` **keeps** already-
  baked ops (timestamps V+1..L) → double-replay / duplicate tracks (corruption).
- If V > L (version bumped ahead of clock): ops in L+1..V that were NOT baked get
  **dropped** → data loss.
Current tests only assert filter arithmetic against hand-picked numbers and never check
that dropped ops were actually inside `snapshot.state`, so they pass despite the bug.

`snapshotManager` is imported only by tests (`lib4.test.ts`, `specs-group1.test.ts`,
`regression-round2-state.test.ts`); no `src/`/`app/` production caller exists.

## Objectives
- Introduce a dedicated, correctly-scoped Lamport cutoff and use it for compaction,
  leaving `version` as a sequence number (unchanged semantics for
  `getLatestSnapshot`/`getSnapshotHistory`).
- Keep the change minimal and non-breaking for existing callers/tests.

## Non-goals
- No change to snapshot creation flow beyond populating the new cutoff field.
- No production-caller behavior (none exists).
