# Design — M9: Branching Op-Log Causal Consistency

## A. Single source of truth in `mergeBranch` (`src/lib/projectBranching.ts`)
Replace the per-field diff application (`applyTrackChanges`/`applyBusChanges` loops
that copy branch final state into `merged`) with op-log replay:

1. Build `merged.crdtOperations = mergeOperations(main.crdtOperations, branchOpsToMerge)`
   (causal-validated, see B).
2. Deep-clone `main.state` as the replay base.
3. Replay the merged op-log in Lamport order (it is already sorted by `mergeOperations`)
   via `applyOperation(base, op)` to produce `merged.tracks`, `merged.buses`,
   `merged.masterPlugins`, `merged.metadata`.
4. Keep `merged.id`/`version`/merge metadata from the field-diff layer (non-entity
   fields) — only the entity collections are now op-log-derived.

Result: materialized state == replay(op-log) for every client, eliminating divergence.

## B. Causal-predecessor validation in `mergeOperations` (`src/lib/crdt.ts`)
- Add optional `deps?: string[]` to `CrdtOperation` (ids of ops that must be present
  first). For entity-add ops, implicitly require the entity's creation op id.
- In `mergeOperations`, after the existing `path+type` dedup (M7 fix), hold back any op
  whose `deps` (or required `add` predecessor) is not present in the accumulating merged
  log; retry held ops after each insertion (bounded passes). Ops that remain unmet after
  bounded passes are dropped and reported (so a missing predecessor never silently
  corrupts state).

## Signatures
- `mergeOperations(a, b)` — unchanged signature; internal causal-hold added.
- `CrdtOperation` — additive `deps?` field (backward compatible).
- `mergeBranch` — unchanged exported signature; internal replay swap.

## Blast radius
- Production caller: `src/components/BranchManager.tsx` (`mergeBranch`). `diffBranches` unchanged.
- Tests: `projectBranching.test.ts`, `specs-group1.test.ts`,
  `regression-round2-state.test.ts`, `lib3.test.ts`, `components3.test.tsx`.
