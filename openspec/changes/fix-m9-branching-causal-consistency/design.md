# Design — M9: Branching Op-Log Causal Consistency

## A. Single source of truth in `mergeBranch` (`src/lib/projectBranching.ts`)
Do NOT replay the entire merged log onto `main.state` (that double-applies main's own
ops and corrupts state). Instead replay only the **net-new / winning delta**:

1. Build `merged.crdtOperations = mergeOperations(main.crdtOperations, branchOpsToMerge)`
   (causal-validated, see B). `mergeOperations` already dedups by `path+type` and keeps
   the Lamport winner, so `merged` contains main's ops plus the branch ops that are
   genuinely new or won conflicts.
2. Compute `deltaOps` = ops in `merged.crdtOperations` whose `id` is **not** present in
   `main.crdtOperations` (i.e., branch-only adds and branch-won overrides).
3. Deep-clone `main.state` as the replay base.
4. Replay `deltaOps` in Lamport order via `applyOperation(base, op)` to derive
   `merged.tracks`, `merged.buses`, `merged.masterPlugins`, `merged.metadata`.
   - Branch-won override: `deltaOps` includes the branch's winning op; applying it onto
     the base (which still holds main's value) overwrites → branch wins, correctly.
   - Branch-only add: appears in `deltaOps` and is applied → entity present.
   - Main-won conflict: excluded from `deltaOps` → base keeps main's value.
   - `masterPlugins` (no op type of its own) is retained from `main.state` and only
     touched by any branch delta ops that target it → no data loss.
5. Keep `merged.id`/`version`/merge metadata from the field-diff layer (non-entity
   fields) — only the entity collections are now op-log-derived.

Result: materialized state == replay(deltaOps onto main.state) for every client,
eliminating divergence without double-applying main's ops.

## B. Causal-predecessor validation in `mergeOperations` (`src/lib/crdt.ts`)
- Add optional `deps?: string[]` to `CrdtOperation` (ids of ops that must be present
  first).
- In `mergeOperations`, after the existing `path+type` LWW dedup (M7 fix), hold back any
  op whose explicitly-declared `deps` are not yet present in the accumulating merged log;
  retry held ops after each insertion (bounded passes). Ops that remain unmet after
  bounded passes are dropped and reported.
- **Scope to explicit `deps` only.** Do NOT infer an implicit "entity add predecessor
  required" rule: `initBranching` seeds `state` without necessarily populating
  `crdtOperations`, so an inferred predecessor requirement would wrongly drop valid
  updates. Only declared `deps` are enforced.

## Signatures
- `mergeOperations(a, b)` — unchanged signature; internal causal-hold added.
- `CrdtOperation` — additive `deps?` field (backward compatible).
- `mergeBranch` — unchanged exported signature; internal replay swap.

## Blast radius
- Production caller: `src/components/BranchManager.tsx` (`mergeBranch`). `diffBranches` unchanged.
- Tests: `projectBranching.test.ts`, `specs-group1.test.ts`,
  `regression-round2-state.test.ts`, `lib3.test.ts`, `components3.test.tsx`.
