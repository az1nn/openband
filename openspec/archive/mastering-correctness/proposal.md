# Proposal: Mastering True-Peak & Limiter Correctness

## Context
Two real correctness bugs exist in the mastering/measurement code that affect
EBU R128 compliance and safe export:

1. **True-peak under-reports (EBU R128).** `truePeak` in `src/lib/lufs.ts`
   oversamples 4× with *linear* interpolation. Linear interpolation is not
   band-limited, so inter-sample peaks are under-estimated. A signal can exceed
   0 dBTP while the meter reports ≤ 0 — dangerous for gating/export decisions.

2. **True-peak limiter applies an undocumented input pre-gain boost.**
   `applyTruePeakLimiter` in `src/lib/mastering.ts` inserts a `GainNode`
   (`inGain`) that boosts the *input* by `|threshold|` dB (e.g. +3 dB for a
   -3 dB threshold) before the compressor. This can push already-hot material
   *above* the ceiling, defeating the limiter. The compressor threshold already
   performs the limiting.

## Problem Description
- Bug 1 produces optimistic (too-low) true-peak readings → bad mastering calls.
- Bug 2 introduces +|threshold| dB of unrequested gain → clipping past ceiling.

## Objectives
- Replace linear 4× upsampling in `truePeak` with a band-limiting windowed-sinc
  low-pass FIR oversampler (`oversample4x`), then take the sample peak of the
  oversampled signal (max of original + oversampled).
- Remove the `inGain` node/boost in `applyTruePeakLimiter`; wire `src` directly
  into `comp`. Keep compressor + waveShaper ceiling unchanged.
- No new dependencies; keep existing function signatures and `-Infinity` empty
  input behavior.
