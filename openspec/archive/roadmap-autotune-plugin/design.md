# Design: Roadmap Auto-Tune Plugin

## Pure core (unit-testable)
```ts
// src/lib/autotune.ts
export function hzToMidi(hz: number): number;          // 69 + 12*log2(hz/440)
export function midiToHz(m: number): number;           // 440 * 2^((m-69)/12)
export const CHROMATIC = [0,1,2,3,4,5,6,7,8,9,10,11];

// snap a frequency to the nearest allowed scale degree
export function quantizeToScale(
  pitchHz: number,
  rootMidi: number,            // 0..11 (C=0)
  scaleIntervals: number[],    // e.g. CHROMATIC or major [0,2,4,5,7,9,11]
  toleranceCents = 0           // if |error| < tolerance, leave unchanged
): number;                    // target Hz
```
Logic: convert `pitchHz`→midi `m`; compute nearest allowed scale note relative to `rootMidi` within an octave; if within `toleranceCents` of the original, return original; else return `midiToHz(targetMidi)`.

## Plugin wiring (`src/lib/pluginChain.ts`)
- Locate the `autoPitch`/`autotune` branch (currently has a `formant` void no-op around line 695/716). Replace the no-op with: build a pitch-detection + shift chain.
- Reuse `src/lib/keyDetection.ts` `detectKey` (or accept `key`/`scale` params) to get `rootMidi` + `scaleIntervals`.
- Use a `ScriptProcessorNode` (consistent with other real-time nodes in the file) that, per buffer block: estimates dominant pitch (reuse `pitchEstimate` from `keyDetection`/`pitchEstimate.ts` if available, else autocorrelation), calls `quantizeToScale`, and applies a short-time pitch shift toward the target (reuse `timeStretchVocoded` style or a simple resample). When `formant` param > 0, apply a linear factor to the shifted signal to approximate formant preservation (or skip formant shift) — keep it simple and real-time-safe.
- If no pitch detected in a block, pass through unchanged (no artifacts).
- Guard for non-web/`AudioContext` absence (fail soft like other nodes).

## Files
- New: `src/lib/autotune.ts` (pure math + helpers).
- Edit: `src/lib/pluginChain.ts` (replace void formant no-op; add import of `quantizeToScale`/`hzToMidi`).
- New: `tests/autotune.test.ts` (pure math) and extend `tests/plugins` coverage or add `tests/autotunePlugin.test.ts` for graph construction with a mock `AudioContext`.

## Tests
- `quantizeToScale`: snaps arbitrary Hz to nearest scale note; leaves within-tolerance pitches unchanged; root/scale correctness for major & chromatic.
- `hzToMidi`/`midiToHz` round-trip (A4=440, C4≈261.63).
- Plugin branch: with a mock `AudioContext` providing `createScriptProcessor`/`createBiquadFilter`, the `autoPitch` branch returns a connected node graph and does not call the void no-op (no exceptions). Ensure `formant` param toggling does not throw.
