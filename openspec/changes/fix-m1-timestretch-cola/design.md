# Design — M1: Granular Time-Stretch COLA Normalization

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
`timeStretch(input, rate, opts?)` and `pitchShift(input, ratio, opts?)` — unchanged.

## Dependencies
None. Pure DSP; no new imports, no config changes.
