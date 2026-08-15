# Tasks: Audio & Recording Correctness Fixes

> **Status: PENDING IMPLEMENTATION.** Checkboxes reflect work to be done. Do NOT
> mark shipped until all items + Verification pass.

## Phase 1 — Spec (this change)
- [x] `proposal.md` — context/problem/objectives/non-goals/approach/risks (H1–H3, M4–M15)
- [x] `design.md` — per-item Current vs New + file-change tables + test requirements
- [x] `tasks.md` — this file

## Phase 2 — Implement (by file)

### A. `src/lib/universalAudio.ts` (H1, M4, M5, M6, M7, M8, M14)
- [ ] `float32ToWavBlob` `:606` — write true 24-bit (3-byte) samples when `bitDepth===24`, else 16-bit (mirror `audio.ts:91-107`).
- [ ] `audioBufferToWavBlob` `:647` — same 24-bit branch.
- [ ] `renderMixdownNative` `:438-439` — unify pan law to balanced equal-power (apply `:469-470` law to mono branch too).
- [ ] `decodeAudioPureJS` `:494` — real MP3 decode path OR throw `UNSUPPORTED_FORMAT` instead of faking a 440 Hz/220 Hz sine `:499`/`:601`.
- [ ] `renderMixdownWeb` `:373` + `renderMixdownNative` `:448` — track resolved blob URLs in a per-render `Map` and revoke them after the decode pass (skip non-`blob:` URLs).
- [ ] `startRecording` `:146` — add `isRecording` guard: reject/early-return if already recording; clear flag in `cleanupRecording`/`stopRecording`.
- [ ] `exportToFile` `:688-699` — defer `URL.revokeObjectURL` via `setTimeout` (or anchor completion listener) after `a.click()`.
- [ ] `renderMixdownWeb` `:378-380` — pass `modTime: 0` + `duration: region.duration` into `applyPluginChain` (region-relative modulation).
- [ ] `dispose()` `:736` already closes `_audioCtx`; ensure `disposeAllAudio` `:95` is callable from Studio unmount.

### B. `app/studio/hooks.ts` (H1, H2, M12)
- [ ] `applyPitchShift` `:477` — pass explicit `audioBufferToWavBlob(rendered, 16)`.
- [ ] `renderTracksCached` `:49-87` — replace module globals `cachedRenderKey`/`cachedRenderUrl` (`:49`/`:50`) with an injected per-instance cache getter/setter.
- [ ] `togglePlay` `:653-715` — serialize through `transportChainRef` mutex; add `disposedRef` unmount guard; never consume a URL revoked by an in-flight render.
- [ ] `rerenderAfterMuteSolo` `:614-652` — acquire the same `transportChainRef` chain.

### C. `app/studio/[id].tsx` (H2, M9, M10, M11)
- [ ] Own render cache via `useRef` (key+url); revoke held URL on unmount `useEffect`.
- [ ] Dispose audio system on unmount (`audioSystem.dispose()` / `disposeAllAudio`).
- [ ] `toggleRecording` `:486-612` — derive `uri` from `await audioRecorder.stop()` result (or ref captured at stop), not from stale `recorderState?.url` `:509`; add `recordingInFlightRef` guard; read latest `tracks` via existing `tracksRef` `:438`.

### D. `src/lib/latencyMonitor.ts` (H3, M13)
- [ ] `createLowLatencyContext` `:35-44` — build a dedicated `new AudioContext()` (web only); never reuse `getSharedAudioContext()`.
- [ ] `disposeLatencySystem` `:169-182` — close only the dedicated `monitorCtx`; do not close the shared ctx.
- [ ] `startDirectMonitor` `:67-101` — return `enabled:false` (+ error) when stream/ctx unavailable; only set `enabled:true` on success `:94`.

### E. `src/lib/clockManager.ts` (H3)
- [ ] `getAudioContext` `:34-37` + `startClock` `:39-48` — native fallback: when no `AudioContext`, drive ticks via `setInterval`/`requestAnimationFrame` fed by a pluggable native playhead time (`player.currentTime`).

### F. `src/lib/stateAssetSeparation.ts` (M15)
- [ ] `commitState` `:219-249` — store `stateJson` (`:226`) on the `ProjectCommit` (`snapshot?: string` field).
- [ ] `revertToCommit` `:261-266` — deserialize `commit.snapshot` via `deserializeProject` and restore `currentProject`; return the restored state.

### G. `src/lib/assetStore.ts` (M6, helper)
- [ ] (optional) expose `isLocalBlob(url)` to let the mixdown pass skip revoking remote URLs.

## Phase 3 — Tests (vitest + legacy)

### H. New/updated vitest tests
- [ ] `tests/audioExport.test.ts` — **WAV round-trip decode** for 16-bit AND 24-bit (encode via `float32ToWavBlob`/`audioBufferToWavBlob` then parse `bitDepth` + sample bytes; assert reconstructed samples within tolerance; assert 24-bit header matches 3-byte stride).
- [ ] `tests/studio-render-cache.test.tsx` — **per-instance invalidation**: re-render after revoke returns a fresh live URL; unmount revokes held URL (no leak).
- [ ] `tests/latency-monitor.test.ts` — **dedicated context**: after `disposeLatencySystem`, `getSharedAudioContext()` is still alive/usable; `startDirectMonitor` returns `enabled:false` on denied mic.
- [ ] `tests/clock-native.test.ts` — **native clock ticking**: with no `AudioContext`, `startClock` fires tick listeners via `setInterval`/`rAF`.
- [ ] `tests/recording.test.ts` — **re-entrancy guard**: second concurrent `startRecording` call rejects/early-returns.
- [ ] `tests/transport-mutex.test.tsx` — **togglePlay mutex**: two rapid calls serialize (single prepare/play); a URL revoked by a later render is not consumed by an earlier in-flight play.
- [ ] `tests/stateAssetSeparation.test.ts` — **revertToCommit** restores the committed snapshot (not live project).
- [ ] `tests/pan-law.test.ts` — native pan equal-power symmetry (center = unity, hard-pan = expected gain).

### I. Legacy node:test
- [ ] `tests/presets.test.ts` / `tests/types.test.ts` unaffected; confirm `npm run test:legacy` still green after changes.

## Phase 4 — Specs update
- [ ] Add Test Requirements from `design.md` §12 to `openspec/specs/audio-transport.md` and/or `openspec/specs/audio-system.md`.

## Verification (must all pass)
- [ ] `npx tsc --noEmit`
- [ ] `cd backend && npx tsc --noEmit`
- [ ] `npx vitest run`
- [ ] `npm run test:legacy`
- [ ] `npm run build`
- [ ] `wsl -e bash -lc "cd /home/az1nn/openband && npm run graph:ci"`
