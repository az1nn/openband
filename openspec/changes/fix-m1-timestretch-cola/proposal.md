# Proposal — M1: Granular Time-Stretch COLA Normalization

## Context
`src/lib/timeStretch.ts` implements a granular overlap-add (OLA) time-stretch and a
`pitchShift`. A code-review checkpoint (docs/code-review-checkpoint-2026-08-20.md, item
M1) flagged the resampling as a correctness risk. Root-cause analysis (subagent) found:

- `timeStretch` sums windowed grains but never divides by the accumulated window
  (no COLA/overlap-add normalization). At `rate!=1` the periodic-Hann window over the
  4x overlap no longer sums to a constant, so the output has rate-dependent gain error
  and amplitude ripple/beating. (Note: `timeStretch` early-returns the input unchanged
  at `rate===1`, so that path is unaffected.)
- `pitchShift` mis-positions identical-length grains by a ratio-scaled offset instead
  of intra-grain resampling, so it never changes pitch; for `ratio>1` it truncates and
  drops most of the signal, for `ratio<1` it leaves a silent tail. It also adds
  unphysical "ghost" copies (`out[nextDst] += sample * 0.5`) causing smearing/echo, and
  lacks normalization entirely.

## Problem
Time-stretched and pitch-shifted audio is the wrong loudness (2x gain, ripple) and
`pitchShift` is functionally broken (no real pitch change, signal loss, echo smear).
Current tests mock these functions or only assert length, so the content bug is
undetected in CI.

## Objectives
- Add COLA normalization to `timeStretch` (divide accumulated output by accumulated
  window) so gain is rate-independent and ripple-free.
- Make `pitchShift` at least gain-correct and free of ghost copies (full pitch-correct
  redesign is explicitly out of scope; this is the safe minimal step).
- Preserve function signatures and output length contract.

## Non-goals
- Full per-grain resampling for true pitch-preserving time-stretch/pitch-shift redesign.
- Changing callers (`src/lib/midiSynth.ts`, `app/studio/hooks.ts`).
