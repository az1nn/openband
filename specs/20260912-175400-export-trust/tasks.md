# Tasks

## Design / gate

- [x] Revalidate `master`, Issue #49 and open PR state.
- [x] Reconstruct L0/L1 context from Constitution, `AGENTS.md`, AI instructions, architecture and launch contract evidence.
- [x] Run Architecture Graph impact preflight for export/render surfaces.
- [x] Materialize T3 spec, plan, tasks and durable audio-export contract.
- [x] Run design-policy / Graph validation on the exact design HEAD.
- [x] Human Design Gate approval on design baseline `ce9de194de49146b0b9db2c0e62efe8d4d6da6aa`; design artifacts subsequently merged by PR #60 as `c439d8fdf6f2bf58816239967198dccc384e90db`.

## Implementation — only after Design Gate

- [x] Add a Blob-producing full-project render path in `src/lib/midiSynth.ts` while preserving the existing playback URL wrapper.
- [x] Add a strict export render profile that propagates source/decode/effect/offline-render failures instead of silently dropping content.
- [x] Normalize track volume/pan percentage values only at the approved strict export boundary; preserve existing default playback semantics in this slice.
- [x] Add `src/lib/exportTrust.ts` with immutable render snapshotting, WAV structural validation and export-specific errors.
- [x] Update `BounceDialog` to use complete project render inputs and the strict WAV export helper.
- [x] Remove misleading AIFF/FLAC/MP3, unused bit-depth/sample-rate success claims, fabricated silent success and silent 300-second WAV truncation from the launch bounce path.
- [x] Update `StudioModals` and Studio route wiring to pass full tracks, buses, mood and active master-rack plugins.
- [x] Keep existing `audioSystem.renderMixdown` consumers compatible; no adapter was required.

## Verification

- [x] Add deterministic WAV fixture tests for RIFF/WAVE structure, non-silent PCM, mute/solo, relative volume and stereo pan.
- [x] Add deterministic MIDI-only export coverage.
- [x] Add launch-scope track/master effect coverage using deterministic effects.
- [x] Add strict missing-asset/decode/effect failure tests and prove inputs/project state remain unchanged.
- [x] Add BounceDialog tests proving WAV-only truthful launch controls and explicit empty/failure behavior.
- [x] Prove ordinary playback renderer compatibility when strict export mode is absent.
- [x] Run targeted export/render tests, including `playbackEngine` and legacy `audioExport` compatibility coverage.
- [x] Run browser export smoke against product commit `ad293ecca532c4a4121c661709c59f76557ceb42`: durable IndexedDB `asset://` source exported as audible RIFF/WAV; missing and corrupt assets produced no download, reached the strict export failure boundary and preserved the stabilized functional project payload. Evidence: Actions run `34758195121`.
- [ ] Run frontend/backend typecheck, full Vitest/legacy tests, Web build, `sdd:check`, Graph tests and `graph:ci` on the final clean PR #63 HEAD.
- [x] Re-run Architecture Graph impact against the implemented production surfaces and confirm T3 remains valid. Evidence remains HIGH for `exportTrust`, `midiSynth`, `BounceDialog` and Studio integration surfaces; Actions run `34758100698` passed.
- [ ] Record exact verified PR #63 HEAD in PR evidence and freeze it for Human Merge Gate without mutating the verified commit.

## Merge / cleanup

- [ ] Human Merge Gate on the exact verified PR #63 HEAD.
- [ ] Human merge only.
- [ ] Confirm #49 / #46 status and remove/reset any temporary verification scaffolding.

## Process exception

- PR #61 merged as product commit `ad293ecca532c4a4121c661709c59f76557ceb42` before the planned Human Merge Gate. This file does **not** retroactively claim that gate occurred.
- PR #63 is the post-merge verification/reconciliation follow-up. Its Human Merge Gate is independent and remains required before merging PR #63.
