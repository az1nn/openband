# Design: Live Modulation Apply Path

## Architecture found

- `src/lib/playbackEngine.ts` — `PlaybackEngine` builds, per track, a
  `TrackNode { source, gain, panner }` connected `source → gain → panner → master`.
  `buildNode` (lines 146-165) creates the nodes; `play` (167) starts sources; `pause`/`stop`
  (212/219) call `stopSources` (388) which tears down all nodes; `dispose` (411) clears state.
- `src/lib/modulationMatrix.ts` — `startModulationEngine()` (336) is a no-op rAF that advances
  `lfoTime`; `applyModulation(target, base, min, max, ctx)` (360) computes
  `base + computeModulation(target,ctx) * (max-min)`, clamped. Offline callers pass a transport
  `time` in seconds. The math assumes `time` is the transport clock.

## Changes

### 1. `src/lib/modulationMatrix.ts`

Add a live-param registry + per-frame apply, and make `startModulationEngine` accept a frame
callback and time source:

- `interface LiveModParam { param: AudioParam; target: ModTarget; min: number; max: number; getBase: () => number | null }`
- `const liveParams = new Map<string, LiveModParam>()`
- `registerLiveModParam(key, param, target, min, max, getBase)`
- `unregisterLiveModParam(key)`
- `clearLiveModParams()`
- `applyLiveModulation(time: number)`: for each registered param, skip if no enabled route
  targets it, skip if `getBase()` returns `null` (mute / automation-baked), otherwise
  `writeParam(param, applyModulation(target, base, min, max, { time }))`. `writeParam` uses
  `param.setTargetAtTime(v, param.context.currentTime, 0.008)` with a `param.value = v` fallback.
- `startModulationEngine(onFrame?, getTime?)`: stores `frameCallback`/`timeSource` (module-level),
  guards against duplicate rAF loops, and each tick calls `frameCallback(timeSource?.() ?? lfoTime)`.
- `stopModulationEngine()` unchanged behavior (cancels rAF, zeroes `lfoTime`).

### 2. `src/lib/playbackEngine.ts`

- Import `startModulationEngine`, `stopModulationEngine`, `registerLiveModParam`,
  `clearLiveModParams`, `applyLiveModulation`.
- In `buildNode` (after wiring, before return): register
  - `vol:${t.id}` → `gain.gain`, target `volume`, range `[0,1]`,
    `getBase = () => this.isAudible(t) ? this.liveGainValue(t) : null`
  - `pan:${t.id}` → `panner.pan`, target `pan.position`, range `[-1,1]`,
    `getBase = () => this.hasPanAuto(t) ? null : this.livePanValue(t)`
- In `play`: after starting sources, call
  `startModulationEngine((time) => applyLiveModulation(time), () => this.getCurrentTime())`.
- In `stopSources` (end): `clearLiveModParams()` (registry tracks live nodes 1:1).
- In `pause` / `stop` / `dispose`: call `stopModulationEngine()`.

## Why this is safe

- No-op when no route is active (skips writes → leaves fader/audibility values untouched).
- Mute/solo respected: `getBase` returns `null` when inaudible, so gain stays at 0.
- Volume/pan automation is baked into the offline stem, so live writes are skipped for those.
- Offline call sites (`pluginChain`, `mastering`, `PluginEditor`) are untouched.
- Plugin-level targets (filter cutoff, etc.) have no retained live node, so they are simply not
  in the registry — consistent with the existing offline-only behavior, not a regression.
