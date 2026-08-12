# Design: Mastering True-Peak & Limiter Correctness

## Bug 1 — `truePeak` (`src/lib/lufs.ts:133`)

Replace the linear-interpolation oversampling block (lines 143-153) with a
proper 4× oversampling low-pass.

### New helper `oversample4x(x: Float32Array): Float32Array`
- Zero-stuff `x` by 4 (upLen = x.length * 4, insert zeros between samples).
- Convolve with a windowed-sinc low-pass FIR:
  - Cutoff `wc = Math.PI / 4` (quarter of new Nyquist after 4× rate).
  - Hamming window, half-length `halfLen = 16` (≈33 taps total).
  - Kernel `h[n] = (n === 0 ? wc/Math.PI : Math.sin(wc*n)/(Math.PI*n)) * (0.54 + 0.46*cos(Math.PI*n/halfLen))`
    for `n` in `[-halfLen, halfLen]`, else 0.
  - Normalize by sum of kernel weights (preserves DC / unity gain at 0 Hz).
- Return the filtered, oversampled signal.

### Updated `truePeak`
- Keep empty-input → `-Infinity`.
- `maxAbs = max(|sample|)` over the *original* samples.
- Compute `os = oversample4x(samples)` and update `maxAbs = max(maxAbs, max|os|)`.
- Return `20*log10(maxAbs)` (or `-Infinity` if `maxAbs <= 0`).

The original-sample peak is retained so a signal with no inter-sample peak is
not artificially raised; the oversampled peak catches genuine inter-sample peaks.

## Bug 2 — `applyTruePeakLimiter` (`src/lib/mastering.ts:343`)

Delete the `inGain` node and its wiring:
- Remove lines 370-371 (`const inGain = ...; inGain.gain.value = ...`).
- Replace:
  `src.connect(inGain); inGain.connect(comp);`
  with:
  `src.connect(comp);`
- Keep `comp` threshold/knee/ratio/attack/release and `waveShaper` ceiling as-is.

The downsample loop (lines 389-395) decimates by picking every `factor`-th
sample (`r[Math.min(r.length-1, Math.floor(i*factor))]`). Since `rendered` is
band-limited to the oversample rate, this decimation is acceptable; leave it.

## Verification
- `truePeak` of a full-scale sine ≤ 0 dBTP and ≥ its sample peak (inter-sample).
- `truePeak` of silence / empty → `-Infinity`.
- `applyMasteringChain` on a full-scale buffer never exceeds the 1.0 ceiling.
