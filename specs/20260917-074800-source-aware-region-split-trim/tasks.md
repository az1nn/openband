# Tasks — Source-aware Region Split and Trim

## Preflight / design

- [x] Revalidate Issue #53 and Launch MVP #46 demand.
- [x] Confirm T3 minimum from persistent `TrackRegion` shape + shared renderer semantics.
- [x] Confirm no existing #53 feature branch/active implementation.
- [x] Trace current `TrackRegion`, `regionEdit`, `projectStore`, `midiSynth`, `universalAudio` and #49 export contract.
- [x] Record the durable source-window contract.
- [x] Define additive compatibility defaults: missing `offset` → `0`; missing `length` → `duration`.
- [ ] Run Architecture Graph preflight on the Design Baseline and record impacted surfaces/blast radius.
- [ ] Run Spec Kit consistency/analyze on the Design Baseline.
- [ ] Freeze exact Design Baseline SHA.
- [ ] HUMAN DESIGN GATE — approve exact baseline SHA before product-code mutation.

## Base reconciliation

- [ ] Confirm #51 / PR #69 is merged to `master` or explicitly superseded.
- [ ] Reconcile `agent/53-source-aware-region-split-trim` with canonical `master`.
- [ ] Re-run impact/analyze after reconciliation.
- [ ] If reconciliation materially changes scope, architecture, dependencies, tier or proof strategy, refresh Human Design Gate.

## Implementation

- [ ] Add optional `offset` / `length` to frontend `TrackRegion`.
- [ ] Mirror additive fields in backend `TrackRegion`.
- [ ] Refactor `regionEdit` around canonical `TrackRegion` semantics and one pure source-window resolver.
- [ ] Preserve split/start-trim/end-trim/move behavior with bounded source invariants.
- [ ] Thread source-window metadata through `midiSynth` decoded-region/render structures.
- [ ] Apply source offset/length to full-project Web Audio scheduling.
- [ ] Apply source offset/length to stem/track/plugin-buffer scheduling paths that consume decoded regions.
- [ ] Extend `universalAudio` Web mixdown region shape and scheduling.
- [ ] Extend pure-JS/native mixdown to read from source sample offset and bounded source length.
- [ ] Preserve tolerant playback behavior and #49 strict export failure semantics.
- [ ] Add persistence round-trip proof without changing persistence ownership.
- [ ] Reconcile `docs/contracts/audio-export.md` only if cross-contract wording is needed.

## Deterministic regression proof

- [ ] Extend `tests/regionEdit.test.ts` for canonical legacy defaults and bounded source windows.
- [ ] Add distinguishable-segment renderer fixture/test that catches source-offset reset-to-zero.
- [ ] Prove split-left and split-right source content.
- [ ] Prove start-trim and end-trim source content.
- [ ] Prove legacy region without source fields.
- [ ] Prove project save/load and JSON export/import retain `offset` / `length`.
- [ ] Prove Web/offline renderer uses expected scheduling window.
- [ ] Prove pure-JS/native sample indexing uses the same window.
- [ ] Prove strict WAV export remains structurally/audibly correct.

## Convergence / verification

- [ ] Run `/speckit.converge`; append remediation tasks instead of weakening requirements.
- [ ] Frontend typecheck PASS.
- [ ] Backend typecheck PASS.
- [ ] Focused tests PASS.
- [ ] Full Vitest PASS.
- [ ] Legacy tests PASS.
- [ ] Web build PASS.
- [ ] Launch-critical Playwright/export regression PASS when required by reconciled CI.
- [ ] Architecture Graph sync/validation PASS on exact HEAD.
- [ ] Architecture specialist review PASS.
- [ ] Audio/DSP specialist review PASS.
- [ ] Spec Kit verification/analyze PASS on exact HEAD.
- [ ] Freeze exact verification HEAD and evidence.
- [ ] HUMAN MERGE GATE — human merges exact verified T3 PR HEAD.
- [ ] Cleanup branch/worktree only after merged state is confirmed.
