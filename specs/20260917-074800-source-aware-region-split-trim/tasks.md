# Tasks — Source-aware Region Split and Trim

## Preflight / design

- [x] Revalidate Issue #53 and Launch MVP #46 demand.
- [x] Confirm T3 minimum from persistent `TrackRegion` shape + shared renderer semantics.
- [x] Confirm no conflicting #53 implementation existed before this feature line.
- [x] Trace current `TrackRegion`, `regionEdit`, `projectStore`, `midiSynth`, `universalAudio` and #49 export contract.
- [x] Record the durable source-window contract.
- [x] Define additive compatibility defaults: missing `offset` → `0`; missing `length` → `duration`.
- [x] Historical Architecture Graph evidence captured against exact baseline `2514843ec7870ddab06c0309da19a16908333d86`; sequencing deviation remains recorded transparently in `verification.md`.
- [x] Spec Kit consistency/analyze: 15/15 requirements mapped; no material inconsistency or Constitution conflict found.
- [x] Freeze exact Design Baseline SHA `2514843ec7870ddab06c0309da19a16908333d86`.
- [x] Historical owner approval recorded on the old baseline; it is non-authoritative under the current automated design/evidence policy.
- [x] Migrate `openband.json` to schemaVersion 2 and materialize the current T3 required-check contract.

## Base reconciliation

- [x] Reconcile current `master@ac46b4df2775a8d8b2d480459e43a3c3093d5b47` into the feature branch via merge commit `9bdc438aadf572352c63fb8f75a2a625115c06e7`.
- [x] Confirm freshness after reconciliation: `behind_by=0`; feature remains limited to the 14 intended #53 files.
- [x] Resolve the only overlapping product file, `src/lib/midiSynth.ts`, by preserving both source-window scheduling and master pan-automation scheduling.
- [x] Classify the 62-commit base movement as material to governance/evidence but not as a product-scope or T4 escalation.
- [ ] Refresh automated design/policy validation, Graph/semantic impact, and affected specialist evidence on the current branch state.

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
- [x] Remove temporary `.github/scripts/apply-53-source-window.py` and `.github/workflows/tmp-53-apply-source-window.yml`.
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
- [ ] Evidence-driven Merge Gate SATISFIED on the exact merge-candidate HEAD/base relationship; repository automation may merge when the full required contract is current.
- [ ] Cleanup branch/worktree only after merged state is confirmed.
