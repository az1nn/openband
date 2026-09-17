# Checklist — Source-aware Region Split and Trim

## Design completeness

- [x] Canonical demand is Issue #53 under Launch MVP #46.
- [x] Tier is T3 minimum; T4 escalation triggers are explicit.
- [x] Existing bug is traced from `regionEdit` source metadata to renderer offset reset.
- [x] Additive `TrackRegion.offset/length` semantics are defined.
- [x] Legacy defaults are defined without project migration.
- [x] Split/start-trim/end-trim invariants are explicit.
- [x] Persistence ownership remains `projectStore` + `assetStore` / `asset://`.
- [x] Web Audio and pure-JS/native renderer behavior are covered.
- [x] #49 strict export failure behavior remains authoritative.
- [x] Time stretching, CRDT, migration, native-build hardening and unrelated UX are excluded.

## Proof quality

- [x] Verification uses sample-content evidence, not duration-only assertions.
- [x] Left/right split content is proved with distinguishable source segments.
- [x] Start/end trim content is proved with distinguishable source segments.
- [x] Legacy project compatibility has explicit renderer proof.
- [x] Persistence round-trip retains source-window fields and asset identity.
- [x] Web/full-project and `universalAudio` Web scheduling have explicit source-window proof.
- [x] Pure-JS/native sample indexing has explicit source-content proof.
- [x] Architecture Graph evidence is recorded for the exact Design Baseline and implementation state.
- [x] Spec Kit consistency maps 15/15 requirements without material conflict.
- [x] Audio specialist finding about effect ordering was fixed rather than waived.

## Gate history

- [x] Exact Design Baseline: `2514843ec7870ddab06c0309da19a16908333d86`.
- [x] Human Design Gate approved on that exact baseline and recorded in PR #71.
- [x] Graph preflight evidence was collected later against that exact baseline; this sequencing deviation is explicitly documented and did not change T3 classification.
- [x] Owner explicitly authorized #53 to proceed independently while #51 human release validation remains deferred.
- [x] Canonical `master` reconciliation completed with `cd996d807615d56ffebf6073f28e0161fcc54b88`; merge commit `be1906d3d8f5c9ef2cc39385d4437e1107058d55`.
- [x] Master reconciliation was non-material to #53 contracts and did not invalidate Design Gate.

## Verification readiness

- [x] Product implementation completed within approved T3 scope.
- [x] Architecture specialist review has no remaining blocker.
- [x] Audio/DSP specialist review has no remaining blocker after remediation in `a058b162ca5676b006a467ef9f6893a9be3ecde5`.
- [x] Temporary implementation/Graph scaffolding removed.
- [ ] Exact clean HEAD passes SDD/Graph, typechecks, full Vitest, legacy, Web build and launch/export regressions required by CI.
- [ ] PR review state and mergeability checked on the exact clean HEAD.
- [ ] Exact verification HEAD frozen in PR evidence.
- [ ] Human Merge Gate approved by project owner.
