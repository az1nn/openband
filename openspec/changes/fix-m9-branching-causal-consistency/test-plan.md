# Test Plan — M9: Branching Op-Log Causal Consistency

## Units under test
- `mergeOperations(a, b)` in `src/lib/crdt.ts`.
- `mergeBranch(...)` in `src/lib/projectBranching.ts`.

## Cases
1. **Convergence invariant** — two branches off a common base; branch B applies
   `t1.update@L7` then `t1.add@L5`, main applies `t1.update@L6`. Merge B into main.
   Assert merged materialized `tracks` equals `replay(merged.crdtOperations)` from base
   (single-source-of-truth invariant).
2. **Causal hold** — assert no op is applied whose entity-`add` predecessor is absent
   (the `add@L5` must be present before `update` referencing it).
3. **Idempotent re-merge** — merging twice (or a second client replaying only
   `crdtOperations`) converges to an identical state.
4. **Negative: unmet deps** — an op whose `deps` are unmet is held, not applied (and
   reported by `mergeOperations`).
5. **Non-regression** — `diffBranches` output unchanged; `BranchManager` merge entry
   point still resolves.

## Fixtures
- In-memory CRDT op logs with explicit Lamport timestamps and entity ids; no audio/3D.

## Risk
MEDIUM: converts `mergeBranch` from field-diff to op-log replay; existing assertions
must be rewritten to replay-based. No UI/audio path affected.
