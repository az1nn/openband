# Proposal: Roadmap Real-Time Auto-Tune Plugin

## Context
The `TUNE (Real-Time)` roadmap section lists **"Auto-tune / pitch correction plugin"** as unimplemented. `src/lib/pluginChain.ts` already has an `autoPitch` (autotune) plugin branch whose `formant` parameter is currently a **void no-op** (no actual pitch quantization). `src/lib/keyDetection.ts` provides `detectKey` and pitch estimation, and `src/lib/timeStretchVocoded.ts` provides phase-vocoder time-stretch. This change implements genuine pitch quantization: detected pitch is snapped to the nearest note in a configurable key/scale, and the audio is pitch-shifted accordingly while preserving formant character when `formant` is enabled.

This is a real-time Web Audio node graph (not offline), built with `AudioWorklet`/Web Audio nodes where feasible, with a pure, unit-testable core function for the quantization math.

## Objectives
1. Implement a pure function `quantizeToScale(pitchHz, rootNote, scaleIntervals, tolerance)` returning the target pitch (Hz) for snapping, fully unit-testable.
2. Wire the `autoPitch` plugin branch in `pluginChain.ts` to perform pitch correction using the detected/selected key, replacing the void `formant` no-op with real (formant-preserving) behavior gated by the `formant` param.
3. Keep the implementation real-time-safe (block-based processing via `ScriptProcessor`/`AudioWorklet` shim consistent with the rest of `pluginChain.ts`; do not block the audio thread).
4. Unit tests for the quantization math and the plugin graph construction.
