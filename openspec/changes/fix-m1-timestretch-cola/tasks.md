# Tasks — M1: Granular Time-Stretch COLA Normalization

- [ ] **T1** In `src/lib/timeStretch.ts` `timeStretch`, add `const norm = new Float32Array(newLength)` and accumulate `norm[dstIdx] += window[i]` inside the grain copy loop alongside `out[dstIdx] += input[srcIdx] * window[i]`.
- [ ] **T2** In `timeStretch`, after the grain loops, normalize: `out[i] = norm[i] > 0 ? out[i] / norm[i] : 0` for all `i`.
- [ ] **T3** In `pitchShift`, remove the ghost-copy loop (`out[nextDst] += sample * 0.5`) and the unused `overlap` variable.
- [ ] **T4** In `pitchShift`, add the same `norm` accumulator + divide step.
- [ ] **T5** Add `tests/timeStretch.test.ts` asserting: (a) `|out.length - round(in.length/rate)| <= 1` for rate in {0.5,1,2}; (b) no NaN/Inf; (c) 1kHz sine RMS at rate=1 within 5% of input RMS; (d) rate=0.5/2.0 first-half vs second-half RMS within 20% (catches ripple); (e) `pitchShift` out.length === in.length and finite.
- [ ] **T6** Run `npx tsc --noEmit` (frontend) — zero errors.
- [ ] **T7** Run `npx vitest run tests/timeStretch.test.ts` — all pass.
- [ ] **T8** Run `npm run graph:ci` — 0 errors (window/orphan checks unaffected).
