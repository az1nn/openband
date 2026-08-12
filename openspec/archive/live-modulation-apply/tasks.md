# Tasks: Apply Modulation Routes During Live Playback

- [ ] Add `LiveModParam` interface + `liveParams` registry to `src/lib/modulationMatrix.ts`
- [ ] Add `registerLiveModParam`, `unregisterLiveModParam`, `clearLiveModParams`
- [ ] Add `applyLiveModulation(time)` that writes modulated values to retained AudioParams
- [ ] Add `writeParam` helper (setTargetAtTime with value fallback)
- [ ] Change `startModulationEngine(onFrame?, getTime?)` to drive a frame callback with the
      transport clock; keep web-only guard + duplicate-loop guard
- [ ] In `src/lib/playbackEngine.ts` `buildNode`, register `vol:` and `pan:` live mod params
- [ ] In `play`, start the modulation engine with `applyLiveModulation` + `getCurrentTime`
- [ ] In `stopSources`, `clearLiveModParams()`; in `pause`/`stop`/`dispose`, `stopModulationEngine()`
- [ ] Run `tsc --noEmit` and fix type errors in touched files
- [ ] Run `vitest run` (full suite); do not edit tests unless one asserts the old no-op behavior
- [ ] Leave implementation uncommitted for code review
