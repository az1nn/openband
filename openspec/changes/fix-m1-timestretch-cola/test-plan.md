# Test Plan — M1: Granular Time-Stretch COLA Normalization

## Units under test
- `timeStretch(buffer: AudioBuffer, rate: number): Promise<AudioBuffer>`
- `pitchShift(buffer: AudioBuffer, semitones: number): Promise<AudioBuffer>`

## Cases
1. **Length contract** — for `rate ∈ {0.5, 2.0}` (NOT 1.0 — `timeStretch` early-returns at
   `rate===1`), `|out.length − round(in.length/rate)| ≤ 1`.
2. **Finite output** — no `NaN`/`Infinity` for any rate (per channel via `getChannelData`).
3. **Gain at rate≠1** — 1 kHz sine @ 44100, `rate ∈ {0.5, 2.0}` → per-channel RMS within ±20%
   of input RMS, and first-half vs second-half RMS within ±20% (detects COLA ripple/beating).
4. **pitchShift length** — `out.length === in.length`, output finite.
5. **pitchShift gain** — `semitones=0` returns input unchanged; `semitones=12` (ratio 2) output
   finite and per-channel RMS within ±20% of input (no ghost-smear inflation after ghost removal).

## Fixtures
- Build `AudioBuffer` the same way the existing `audioPlayback`-style tests do (e.g.
  `new OfflineAudioContext(ch, len, sr).createBuffer(ch, len, sr)`), fill channel 0 with a
  procedural 1 kHz sine. Mirror the buffer-construction approach used by `audioPlayback.test.ts`.

## Non-regression
- Existing `audioPlayback.test.ts` only asserts `pitchShift` length; keep passing.
- `studio.test.tsx` / `studioHooksFixes.test.ts` mock these functions; unaffected.
