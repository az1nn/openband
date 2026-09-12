# Design Review Findings

## Findings resolved in the design

1. `BounceDialog` currently strips MIDI/plugins/routes by mapping `TrackDef` to a reduced export shape.
2. The current format UI can rename a WAV result as AIFF/FLAC and advertises bit-depth/sample-rate choices not consumed by the renderer.
3. A no-track export can fabricate a silent placeholder and report success.
4. WAV duration is silently truncated to 300 seconds in the dialog.
5. The legacy region-oriented mixdown can return silence for MIDI-only content.
6. Track volume/pan percentage semantics are unsafe at the current Web bus-routing boundary without normalization.
7. Playback render caching intentionally omits live mixer controls and is therefore not export authority.
8. Existing tests prove Blob creation more often than musical/export correctness.

## Approved-design invariant

The implementation must remain an export-trust hardening slice. If convergence requires a new renderer architecture or deterministic DSP algorithm changes, stop implementation, reclassify the risk and obtain a fresh Human Design Gate.
