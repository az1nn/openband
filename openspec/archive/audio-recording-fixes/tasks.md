# Tasks: Audio & Recording Correctness Fixes

## Status: SHIPPED

## Phase 1 — Spec (this change)
- [x] `proposal.md` — context/problem/objectives/non-goals/approach/risks (H1–H3, M4–M15)
- [x] `design.md` — per-item Current vs New + file-change tables + test requirements
- [x] `tasks.md` — this file

## Phase 2 — Implement (by file)

### A. `src/lib/universalAudio.ts` (H1, M4, M5, M6, M7, M8, M14)
- [x] `float32ToWavBlob` `:606` — write true 24-bit (3-byte) samples when `bitDepth===24`, else 16-bit (mirror `audio.ts:91-107`).
- [x] `audioBufferToWavBlob` `:647` — same 24-bit branch.
- [x] `renderMixdownNative` `:438-439` — unify pan law to balanced equal-power (apply `:469-470` law to mono branch too).
- [x] `decodeAudioPureJS` `:494` — real MP3 decode path OR throw `UNSUPPORTED_FORMAT` instead of faking a 440 Hz/220 Hz sine `:499`/`:601`.
- [x] `renderMixdownWeb` `:373` + `renderMixdownNative` `:448` — track resolved blob URLs in a per-render `Map` and revoke them after the decode pass (skip non-`blob:` URLs).
- [x] `startRecording` `:146` — add `isRecording` guard: reject/early-return if already recording; clear flag in `cleanupRecording`/`stopRecording`.
- [x] `exportToFile` `:688-699` — defer `URL.revokeObjectURL` via `setTimeout` (or anchor completion listener) after `a.click()`.
- [x] `renderMixdownWeb` `:378-380` — pass `modTime: 0` + `duration: region.duration` into `applyPluginChain` (region-relative modulation).
- [x] `dispose()` `:736` already closes `_audioCtx`; ensure `disposeAllAudio` `:95` is callable from Studio unmount.

### B. `app/studio/hooks.ts` (H1, H2, M12)
- [x] `applyPitchShift` `:477` — pass explicit `audioBufferToWavBlob(rendered, 16)`.
- [x] `renderTracksCached` `:49-87` — replace module globals `cachedRenderKey`/`cachedRenderUrl` (`:49`/`:50`) with an injected per-instance cache getter/setter.
- [x] `togglePlay` `:653-715` — serialize through `transportChainRef` mutex; add `disposedRef` unmount guard; never consume a URL revoked by an in-flight render.
- [x] `rerenderAfterMuteSolo` `:614-652` — acquire the same `transportChainRef` chain.

### C. `app/studio/[id].tsx` (H2, M9, M10, M11)
- [x] Own render cache via `useRef` (key+url); revoke held URL on unmount `useEffect`.
- [x] Dispose audio system on unmount (`audioSystem.dispose()` / `disposeAllAudio`).
- [x] `toggleRecording` `:486-612` — derive `uri` from `await audioRecorder.stop()` result (or ref captured at stop), not from stale `recorderState?.url` `:509`; add `recordingInFlightRef` guard; read latest `tracks` via existing `tracksRef` `:438`.

### D. `src/lib/latencyMonitor.ts` (H3, M13)
- [x] `createLowLatencyContext` `:35-44` — build a dedicated `new AudioContext()` (web only); never reuse `getSharedAudioContext()`.
- [x] `disposeLatencySystem` `:169-182` — close only the dedicated `monitorCtx`; do not close the shared ctx.
- [x] `startDirectMonitor` `:67-101` — return `enabled:false` (+ error) when stream/ctx unavailable; only set `enabled:true` on success `:94`.

### E. `src/lib/clockManager.ts` (H3)
- [x] `getAudioContext` `:34-37` + `startClock` `:39-48` — native fallback: when no `AudioContext`, drive ticks via `setInterval`/`requestAnimationFrame` fed by a pluggable native playhead time (`player.currentTime`).

### F. `src/lib/stateAssetSeparation.ts` (M15)
- [x] `commitState` `:219-249` — store `stateJson` (`:226`) on the `ProjectCommit` (`snapshot?: string` field).
- [x] `revertToCommit` `:261-266` — deserialize `commit.snapshot` via `deserializeProject` and restore `currentProject`; return the restored state.

### G. `src/lib/assetStore.ts` (M6, helper)
- [x] (optional) expose `isLocalBlob(url)` to let the mixdown pass skip revoking remote URLs.

## Phase 3 — Tests (vitest + legacy)

### H. New/updated vitest tests
- [x] `tests/audioExport.test.ts` — **WAV round-trip decode** for 16-bit AND 24-bit (encode via `float32ToWavBlob`/`audioBufferToWavBlob` then parse `bitDepth` + sample bytes; assert reconstructed samples within tolerance; assert 24-bit header matches 3-byte stride).
- [x] `tests/studio-render-cache.test.tsx` — **per-instance invalidation**: re-render after revoke returns a fresh live URL; unmount revokes held URL (no leak).
- [x] `tests/latency-monitor.test.ts` — **dedicated context**: after `disposeLatencySystem`, `getSharedAudioContext()` is still alive/usable; `startDirectMonitor` returns `enabled:false` on denied mic.
- [x] `tests/clock-native.test.ts` — **native clock ticking**: with no `AudioContext`, `startClock` fires tick listeners via `setInterval`/`rAF`.
- [x] `tests/recording.test.ts` — **re-entrancy guard**: second concurrent `startRecording` call rejects/early-returns.
- [x] `tests/transport-mutex.test.tsx` — **togglePlay mutex**: two rapid calls serialize (single prepare/play); a URL revoked by a later render is not consumed by an earlier in-flight play.
- [x] `tests/stateAssetSeparation.test.ts` — **revertToCommit** restores the committed snapshot (not live project).
- [x] `tests/pan-law.test.ts` — native pan equal-power symmetry (center = unity, hard-pan = expected gain).

### I. Legacy node:test
- [x] `tests/presets.test.ts` / `tests/types.test.ts` unaffected; confirm `npm run test:legacy` still green after changes.

## Phase 4 — Specs update
- [x] Add Test Requirements from `design.md` §12 to `openspec/specs/audio-transport.md` and/or `openspec/specs/audio-system.md`.

## Verification (must all pass)
- [x] `npx tsc --noEmit`
- [x] `cd backend && npx tsc --noEmit`
- [x] `npx vitest run`
- [x] `npm run test:legacy`
- [x] `npm run build`
- [x] `wsl -e bash -lc "cd /home/az1nn/openband && npm run graph:ci"`

## Code Review

- **B-1 (clockManager rAF timebase):** fixed — native fallback now drives ticks via `setInterval`/`requestAnimationFrame` fed by the pluggable playhead time (`player.currentTime`) when no `AudioContext` is present.
- **B-2 (RenderCache unified to single component-scope ref):** fixed — `renderTracksCached`/`applyPitchShift` no longer rely on module globals; a single per-instance `useRef` cache (key+url) is injected and the held URL is revoked on unmount and after invalidation, eliminating stale/revoked blob reuse.
- **B-3 (togglePlay unhandled rejection):** wrapped in try/catch — the transport mutex + `disposedRef` guard prevent play on a URL revoked by an in-flight render, and the async call is now rejection-safe.
- **C-2 (stray comments removed):** resolved — comments flagged in review were removed from the touched files.

**Tests:** 32 new vitest tests passing; `tsc` clean (only pre-existing react-native `TS7016` module declarations); legacy 26/26 passing.
