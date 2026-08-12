# Tasks: Mastering True-Peak & Limiter Correctness

- [ ] Write spec files (proposal.md, design.md, tasks.md) under
      `openspec/changes/mastering-correctness/`
- [ ] Commit spec files only
- [ ] BUG 1: Add `oversample4x(x: Float32Array): Float32Array` helper to
      `src/lib/lufs.ts` (windowed-sinc Hamming, halfLen=16, wc=π/4, DC-normalized)
- [ ] BUG 1: Rewrite `truePeak` to oversample via `oversample4x`, take max peak
      of original + oversampled, return `20*log10(maxAbs)`; keep `-Infinity`
- [ ] BUG 2: Remove `inGain` node + wiring in `applyTruePeakLimiter`
      (`src/lib/mastering.ts`); connect `src.connect(comp)` directly
- [ ] BUG 2: Confirm `comp` + `waveShaper` ceiling unchanged; leave downsample
      loop as-is
- [ ] Run `npx tsc --noEmit` and fix type errors in touched files
- [ ] Run `npx vitest run src/lib/lufs src/lib/mastering` and confirm pass
- [ ] Leave implementation UNCOMMITTED for orchestrator review
