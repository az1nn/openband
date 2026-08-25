# Test Plan — M1: Granular Time-Stretch COLA Normalization

## Units under test
- `timeStretch(input: Float32Array, rate: number, opts?): Float32Array`
- `pitchShift(input: Float32Array, ratio: number, opts?): Float32Array`

## Cases
1. **Length contract** — for `rate ∈ {0.5, 1.0, 2.0}`, `|out.length − round(in.length/rate)| ≤ 1`.
2. **Finite output** — no `NaN`/`Infinity` for any rate.
3. **Gain at rate=1** — 1 kHz sine @ 44100, `rate=1` → `rms(out) ≈ rms(in)` (±5%).
4. **Ripple at rate≠1** — `rate ∈ {0.5, 2.0}` → overall RMS within ±20% of input AND
   first-half RMS vs second-half RMS within ±20% (detects COLA ripple/beating).
5. **pitchShift length** — `out.length === in.length`, output finite.
6. **pitchShift gain** — `ratio=1` RMS within ±10% of input (no ghost-smear inflation).

## Fixtures
- Procedural 1 kHz sine (no asset files). 1024-sample buffer, periodic-Hann window.

## Non-regression
- Existing `audioPlayback.test.ts` only asserts `pitchShift` length; keep passing.
- `studio.test.tsx` / `studioHooksFixes.test.ts` mock these functions; unaffected.
