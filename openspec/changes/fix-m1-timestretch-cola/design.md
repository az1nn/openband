# Design — M1: Granular Time-Stretch COLA Normalization

## Real signatures (verified)
- `timeStretch(buffer: AudioBuffer, rate: number): Promise<AudioBuffer>` — **early-returns the input buffer unchanged when `rate === 1`** (line 64). So the COLA bug manifests only at `rate !== 1`.
- `pitchShift(buffer: AudioBuffer, semitones: number): Promise<AudioBuffer>` — `ratio = 2^(semitones/12)`, output length == input length.

Both build an `OfflineAudioContext` + `createBuffer` and write channels via `getChannelData(ch)`. No `opts` parameter exists. Window is a periodic-Hann of `grainSize=2048`, `hopSize=512` (4x overlap → gain ~4x without normalization).

## `timeStretch` (src/lib/timeStretch.ts)
Add a normalization accumulator aligned with the output:

```
const newLength = Math.max(1, Math.round(input.length / rate));
const out = new Float32Array(newLength);
const norm = new Float32Array(newLength);
...
// in the grain copy loop:
out[dstIdx] += input[srcIdx] * window[i];
norm[dstIdx] += window[i];
...
// after all grains:
for (let i = 0; i < newLength; i++) {
  out[i] = norm[i] > 0 ? out[i] / norm[i] : 0;
}
```

This enforces COLA normalization for any `rate`, fixing both the ~2x gain at `rate=1`
and the ripple/beating at other rates. The output length contract
(`round(input.length / rate)`) is unchanged.

## `pitchShift` (src/lib/timeStretch.ts)
- Remove the unphysical ghost-copy loop (`out[nextDst] += sample * 0.5`) and the
  now-unused `overlap` variable.
- Add the same `norm` accumulator + divide step so `pitchShift` is gain-correct.
- Output length stays equal to input length.

## Signatures
`timeStretch(buffer, rate)` and `pitchShift(buffer, semitones)` — unchanged (async, AudioBuffer in/out).

## Dependencies
None. Pure DSP; no new imports, no config changes.
