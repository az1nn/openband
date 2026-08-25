# Tasks — M9: Branching Op-Log Causal Consistency

- [ ] **T1** In `src/lib/crdt.ts`, add optional `deps?: string[]` to `CrdtOperation`.
- [ ] **T2** In `mergeOperations` (crdt.ts), after the existing `path+type` LWW dedup, add bounded causal-hold: hold ops whose `deps` (or required entity `add` predecessor by id) are not yet in the accumulating merged log; retry held ops after each insertion; drop unmet-after-bounded-passes and report them.
- [ ] **T3** In `src/lib/projectBranching.ts` `mergeBranch`, replace the per-field `applyTrackChanges`/`applyBusChanges` loops with: compute `merged.crdtOperations = mergeOperations(main.crdtOperations, branchOpsToMerge)`, derive `deltaOps = merged.crdtOperations whose id is not in main.crdtOperations`, deep-clone `main.state`, and replay `deltaOps` (Lamport order) via `applyOperation` to derive `tracks`/`buses`/`masterPlugins`/`metadata`.
- [ ] **T4** Update existing `projectBranching.test.ts` / `specs-group1.test.ts` assertions that checked field-diff outputs to assert replay-based convergence (materialized == replay(op-log)).
- [ ] **T5** Add vitest: two branches off a common base; branch B gets `t1.update@L7` then `t1.add@L5`, main gets `t1.update@L6`; merge B into main; assert (a) merged materialized `tracks` == replay of merged op-log, (b) no op applied whose `add` predecessor is absent, (c) re-merge is idempotent and converges identically on a second client replaying only `crdtOperations`.
- [ ] **T6** Add negative vitest: an op whose `deps` are unmet is held, not applied.
- [ ] **T7** Run `npx tsc --noEmit` (frontend) — zero errors.
- [ ] **T8** Run `npx vitest run tests/projectBranching.test.ts tests/specs-group1.test.ts tests/regression-round2-state.test.ts tests/lib3.test.ts tests/components3.test.tsx` plus new cases — all pass.
- [ ] **T9** Run `npm run graph:ci` — 0 errors.
