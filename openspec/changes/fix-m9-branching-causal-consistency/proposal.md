# Proposal — M9: Branching Op-Log Causal Consistency

## Context
`src/lib/projectBranching.ts` `mergeBranch` (lines 260–342) keeps **two independent
sources of truth** that never reconcile:
- A **materialized state** built by a 2-way field diff: `merged = clone(main.state)`
  then per-field copy from branch's final state (`applyTrackChanges`/`applyBusChanges`).
- A **CRDT op-log** merged separately at lines 333–336:
  `merged.crdtOperations = mergeOperations(merged.crdtOperations, branchOpsToMerge)`.

The op-log is never replayed to derive `tracks`/`buses`; it drifts from the
materialized state. Deeper, `src/lib/crdt.ts` `CrdtOperation` has **no `prev`/`deps`/
vector-clock field**, so `mergeOperations` cannot detect or reject an op whose causal
predecessors are missing. It keys conflict resolution on `path+type+userId` and
silently overwrites same-user ops; it sorts by Lamport but never validates causal
delivery. A client replaying `crdtOperations` (the intended SSE path) converges to a
different state than the field-diffed materialized state → divergent states across
clients. This is the design-level bug M9.

## Problem
Merged branches are not causally consistent: (a) materialized state and op-log diverge,
so replay-based convergence differs from field-diff convergence; (b) ops whose causal
predecessors are absent can be applied (no dependency validation).

## Objectives
- Make the merged **op-log the single source of truth**: after merging the op-log,
  re-derive `merged.tracks`/`buses`/`masterPlugins`/`metadata` by replaying the full
  merged `crdtOperations` in Lamport order via `applyOperation` onto a deep-cloned main
  base. Drop the per-field diff loops for those entities.
- Add **causal-predecessor validation** to `mergeOperations`: hold back/queue any op
  whose declared `deps` (or, minimally, whose target-entity `add` op by id) is not yet
  present in the merged log, so missing predecessors are never applied.

## Non-goals
- No change to `diffBranches` (unaffected).
- No change to `BranchManager.tsx` UI contract.

## Risk
MEDIUM: behavior change for `mergeBranch` convergence; existing field-diff test
assertions must move to replay-based assertions. Localized to branching + CRDT core;
no UI/audio impact.
