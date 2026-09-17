# Tasks — Source-aware Region Split and Trim

## Preflight / design

- [x] Revalidate Issue #53 and Launch MVP #46 demand.
- [x] Confirm T3 minimum from persistent `TrackRegion` shape + shared renderer semantics.
- [x] Confirm no conflicting #53 implementation existed before this feature line.
- [x] Trace current `TrackRegion`, `regionEdit`, `projectStore`, `midiSynth`, `universalAudio` and #49 export contract.
- [x] Record the durable source-window contract.
- [x] Define additive compatibility defaults: missing `offset` → `0`; missing `length` → `duration`.
- [x] Architecture Graph evidence captured against exact Design Baseline `2514843ec7870ddab06c0309da19a16908333d86` — captured after Design Gate; sequencing deviation recorded transparently in `verification.md`.
- [x] Spec Kit consistency/analyze: 15/15 requirements mapped; no material inconsistency or Constitution conflict found.
- [x] Freeze exact Design Baseline SHA `2514843ec7870ddab06c0309da19a16908333d86`.
- [x] HUMAN DESIGN GATE — owner approved the exact baseline before product-code mutation; approval recorded in PR #71.

## Base reconciliation

- [x] Owner explicitly authorized #53 to proceed independently while #51 / PR #69 remains blocked only on deferred human release validation.
- [x] Reconcile feature branch with canonical `master` `cd996d807615d56ffebf6073f28e0161fcc54b88` via merge commit `be1906d3d8f5c9ef2cc39385d4437e1107058d55`.
- [x] Analyze reconciliation delta: PR #70 added marketing documentation only; no region/persistence/audio contract changed.
- [x] Re-run impact/Graph after implementation; no T4 escalation trigger found.
- [x] Design Gate remains valid because reconciliation did not materially alter scope, architecture, dependencies, tier or proof strategy.

## Implementation

- [x] Add optional `offset` / `length` to frontend `TrackRegion`.
- [x] Mirror additive fields in backend `TrackRegion`.
- [x] Refactor `regionEdit` around canonical `TrackRegion` semantics and one pure source-window resolver.
- [x] Preserve split/start-trim/end-trim/move behavior with bounded source invariants.
- [x] Thread source-window metadata through `midiSynth` decoded-region/render structures.
- [x] Apply source offset/length to full-project Web Audio scheduling.
- [x] Apply source offset/length to stem/track/plugin-buffer scheduling paths that consume decoded regions.
- [x] Extend `universalAudio` Web mixdown region shape and scheduling.
- [x] Apply the selected source window before Web track effects so pre-trim audio cannot influence stateful effects.
- [x] Extend pure-JS/native mixdown to read from source sample offset and bounded source length.
- [x] Preserve tolerant playback behavior and #49 strict export failure semantics.
- [x] Add persistence round-trip proof without changing persistence ownership.
- [x] Keep `docs/contracts/audio-export.md` unchanged; `docs/contracts/region-source-semantics.md` owns the new semantics.

## Deterministic regression proof

- [x] Preserve existing `tests/regionEdit.test.ts` and add canonical legacy/bounded source-window coverage.
- [x] Add distinguishable-segment renderer fixture that catches source-offset reset-to-zero.
- [x] Prove split-left and split-right source content.
- [x] Prove start-trim and end-trim source content.
- [x] Prove legacy region without source fields schedules from source zero for timeline duration.
- [x] Prove project save/load and JSON export/import retain `offset` / `length` and asset identity.
- [x] Prove Web/full-project renderer uses expected scheduling window.
- [x] Prove `universalAudio` Web scheduling uses the same window.
- [x] Prove pure-JS/native sample indexing uses the same window.
- [x] Keep strict WAV export on the shared `midiSynth` source-window renderer and #49 strict failure contract.

## Convergence / verification

- [x] Convergence review completed: no requirement weakened; audio specialist finding was remediated in product code and proof expanded.
- [x] Focused source-window suite PASS before final cleanup: run `35226307146`, 17/17 at reviewed implementation commit `a058b162ca5676b006a467ef9f6893a9be3ecde5`; additional FR-013 proof added afterward for final CI.
- [x] Frontend typecheck PASS during implementation/review workflow.
- [x] Backend typecheck PASS during initial bounded implementation workflow.
- [x] Architecture Graph baseline + implementation evidence PASS: run `35226545143`; baseline 508 nodes / 1374 edges, implementation evidence 510 / 1381; validation and Graph CI PASS.
- [x] Architecture specialist review: T3 appropriate; ownership/boundaries unchanged; no T4 trigger.
- [x] Audio/DSP specialist review: initial effect-order inconsistency fixed; source selection now precedes track effects; no context/blob/realtime lifecycle expansion.
- [ ] Remove temporary `.github/scripts/apply-53-source-window.py` and `.github/workflows/tmp-53-apply-source-window.yml`.
- [ ] Final frontend typecheck PASS on exact clean HEAD.
- [ ] Final backend typecheck PASS on exact clean HEAD.
- [ ] Final focused tests PASS on exact clean HEAD.
- [ ] Full Vitest PASS on exact clean HEAD.
- [ ] Legacy tests PASS on exact clean HEAD.
- [ ] Web build PASS on exact clean HEAD.
- [ ] Launch-critical Playwright/export regression PASS when required by current CI.
- [ ] Architecture Graph sync/validation PASS on exact clean HEAD.
- [ ] Spec Kit SDD policy check PASS on exact clean HEAD.
- [ ] Confirm no blocking PR review threads/reviews and PR mergeability.
- [ ] Freeze exact verification HEAD and evidence in PR conversation.
- [ ] HUMAN MERGE GATE — human merges exact verified T3 PR HEAD.
- [ ] Cleanup branch/worktree only after merged state is confirmed.
