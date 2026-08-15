# Proposal: Audio & Recording Correctness Fixes

> **Status: PENDING IMPLEMENTATION.** Not yet shipped. This change covers the
> HIGH + MED severity defects enumerated in the audio/recording audit below.
> Test requirements and source fixes are specified in `design.md` and `tasks.md`.

## Context

The OpenBand audio engine (`src/lib/universalAudio.ts`, `app/studio/hooks.ts`,
`app/studio/[id].tsx`) works for the common web happy-path but harbors a cluster
of latent defects across the WAV export path, the shared render cache, the
shared `AudioContext`, native (non-web) audio, and the recording/transport
lifecycle. These were surfaced by a focused audio/recording audit and reproduce
as: corrupted 24-bit exports, silently-disabled web pitch shift, broken
playback after a pitch-shift render, dead native clock/playhead, native pan
loudness bias, wrong native MP3 decode, blob-URL leaks, recording re-entrancy /
double-start, premature download revoke, undisposed singleton `AudioContext`,
stale native stop URI, stale `toggleRecording` closure, `togglePlay`
concurrency races, latency-monitor false "active", modulation scheduled past
the buffer, and a `revertToCommit` no-op.

The existing specs (`openspec/specs/audio-transport.md`,
`openspec/specs/audio-system.md`) describe the intended transport/export flow
but do not pin down any of these edge cases. This change closes the gap and
fixes the root causes for all 15 audit items.

## Problem Description

### HIGH

**H1 — WAV 24-bit export corruption.** The private encoders in
`src/lib/universalAudio.ts` `float32ToWavBlob` (`:606`) and `audioBufferToWavBlob`
(`:647`) always write **16-bit** samples via `view.setInt16(...)` regardless of
`bitDepth`. Callers pass `bitDepth: 24` (`renderMixdownWeb` `:363`/`:410`,
`renderMixdownNative` `:488`, and `audioBufferToWavBlob` `:733` uses 16). A 24-bit
header with 16-bit samples laid out at a 3-byte stride produces gaps → corrupted
exports. Additionally `app/studio/hooks.ts` `applyPitchShift` (`:456`) calls
`audioBufferToWavBlob(rendered)` at `:477` with **no** `bitDepth`. It imports the
*good* encoder from `src/lib/audio.ts:71` (default 16, handles 24-bit correctly),
so it does not currently throw — but it silently relies on the default and is
fragile; an explicit `16` should be passed and the round-trip decode path must be
covered.

**H2 — Shared render-cache invalidation / blob reuse.** `app/studio/hooks.ts`
module-global `cachedRenderKey`/`cachedRenderUrl` (`:49`/`:50`) are shared across
every Studio instance/project and never revoked on unmount. `renderTracksCached`
(`:53`) returns the cached URL; `applyPitchShift` (`:480`) revokes the cached URL
so the next identical render returns a revoked blob → broken playback.

**H3 — Shared AudioContext takeover.**
- `src/lib/latencyMonitor.ts` `createLowLatencyContext` (`:35-44`) reuses the
  singleton `getSharedAudioContext()` as the monitor context; `disposeLatencySystem`
  (`:169-182`) may `monitorCtx.close()` it → kills the global `AudioContext` used by
  playback/recording/mixdown.
- `src/lib/clockManager.ts` `getAudioContext` (`:34-37`) returns `null` off-web;
  `startClock` (`:39-48`) early-returns when the ctx is null → native playhead /
  presence clock is dead.

### MED

**M4 — Native pan loudness bias.** `src/lib/universalAudio.ts` `renderMixdownNative`
`:438-439` computes `rightGain = trackGain*(pan>0?1+pan:1)` (right too loud); the
stereo branch `:469-470` uses the correct balanced law. The two branches disagree.

**M5 — Pure-JS MP3 decoder fakes a 440 Hz tone.** `src/lib/universalAudio.ts`
`decodeAudioPureJS` (`:494-` :597-ish, sine fallback at `:499`/`:601`) returns a
synthetic sine for MP3/ID3 on native → native MP3 playback is wrong. There is no
real MP3 decode path.

**M6 — Blob URL leak in mixdown.** `resolveAssetUrl` (`src/lib/assetStore.ts:117`)
returns blob URLs that `renderMixdownWeb`/`:373` and `renderMixdownNative`/`:448`
fetch + decode but never revoke; `assetCache` grows for the process lifetime.

**M7 — Recording re-entrancy guard.** `src/lib/universalAudio.ts` `startRecording`
(`:146-185`) has no in-progress guard; a second call overwrites
`recordingStream`/`recordingWorkletNode`.

**M8 — `exportToFile` immediate revoke.** `src/lib/universalAudio.ts` `exportToFile`
(`:688-699`) revokes the object URL right after `a.click()` → the download may
abort.

**M9 — Singleton AudioContext never disposed.** `src/lib/universalAudio.ts`
`_audioCtx` (`:103`/`:736-742`) is only closed by `dispose()`; `disposeAllAudio`
(`:95`) has no transport caller on Studio unmount.

**M10 — Native stop stale URI.** `app/studio/[id].tsx:509`
`uri = recorderState?.url ?? audioRecorder.uri` is read immediately after
`await audioRecorder.stop()` while React state may not have updated.

**M11 — `toggleRecording` stale closure.** `app/studio/[id].tsx` `toggleRecording`
(`:486-612`) reads `isRecording`/`tracks` from the closure; rapid double-tap can
start two recordings.

**M12 — `togglePlay` concurrency guard.** `app/studio/hooks.ts` `togglePlay`
(`:653-715`) and `rerenderAfterMuteSolo` (`:614-652`) have no mutex → rapid taps
run two prepare/play sequences; a render URL can be revoked by one in-flight
render while another uses it.

**M13 — Latency monitor false "active".** `src/lib/latencyMonitor.ts`
`startDirectMonitor` (`:67-101`) returns `monitorState` (with `enabled:true` only
set on success at `:94`) — but callers flip `monitoring=true` regardless, and when
`stream`/`monitorCtx` is null (mic denied) it still returns a state object.

**M14 — `pluginChain` modTime past buffer.** `src/lib/universalAudio.ts` render
passes `modTime: region.start` (`:380`) into `applyPluginChain`; modulation
(`src/lib/pluginChain.ts` `applySinglePlugin` `:273`, `applyModulation` at `:208`)
schedules events at `modTime + offset` inside a context sized to the region length
→ events past the buffer end are dropped. Modulation must be region-relative.

**M15 — `stateAssetSeparation` `revertToCommit` no-op.** `src/lib/stateAssetSeparation.ts`
`revertToCommit` (`:261-266`) finds the commit but returns `currentProject`
unchanged. `commitState` (`:219-249`) computes `stateJson` (`:226`) but never stores
it on the commit, so there is nothing to restore.

## Objectives

1. Produce bit-accurate WAV exports for 16-bit **and** 24-bit, and guard the
   pitch-shift encode path with an explicit depth + a round-trip decode test.
2. Make the Studio render cache **per-instance** and invalidate/revoke correctly
   on unmount so no render returns a dead blob URL.
3. Isolate the monitor `AudioContext` from the shared playback/record/mixdown
   context, and give native a working clock source.
4. Fix native pan law, add a real (or explicitly unsupported) native decode path,
   plug blob-URL leaks, add recording re-entrancy + transport mutexes, defer the
   export download revoke, dispose the singleton context on unmount, derive the
   native stop URI from the stop result, make `toggleRecording` ref-guarded, and
   make modulation region-relative.
5. Make `revertToCommit` actually restore the committed snapshot.

## Non-Goals

- Replacing the native `decodeAudioPureJS` with a full MP3 decoder. We either add a
  best-effort real decode or surface an explicit unsupported-format error — not a
  new heavy dependency.
- Changing the CDN Three.js / 3D pipeline (unrelated to audio).
- Altering the web-autoplay resume policy already fixed in `web-playback-fix`.

## Approach Summary

- **WAV encoders:** write true 24-bit (3-byte) samples in both private encoders
  (branch on `bitDepth`); `applyPitchShift` passes explicit `16`. Add a vitest
  WAV round-trip (encode → `decodeAudioData`/`DataView` assert) for 16 & 24 bit.
- **Render cache:** move `cachedRenderKey`/`cachedRenderUrl` into a per-instance
  `useRef`/context owned by `app/studio/[id].tsx`; revoke on unmount and invalidate
  the key whenever a URL is revoked.
- **Monitor context:** `createLowLatencyContext` builds a **dedicated**
  `new AudioContext()`; `disposeLatencySystem` only closes that dedicated ctx.
- **Native clock:** `startClock`/`getAudioContext` fall back to a `setInterval` /
  `requestAnimationFrame` driver fed by `player.currentTime` when off-web.
- **Pan law:** unify `renderMixdownNative` mono+stereo branches to the balanced
  equal-power law; add a `decodeAudioPureJS` MP3 error path or minimal real decode.
- **Blob leaks:** revoke per-render resolved blob URLs after decode (local map
  built per render pass).
- **Re-entrancy / mutexes:** `isRecording` flag in `startRecording`; a serialized
  promise-chain transport mutex in `togglePlay`; ref-guarded `toggleRecording`.
- **Modulation:** pass `modTime: 0` (region-relative) from the render pass.
- **revertToCommit:** persist `stateJson` on the commit; restore via
  `deserializeProject`.

## Risks

- A dedicated monitor `AudioContext` adds one more context (browser limit ~6
  simultaneous). It is created lazily and closed on dispose, so it stays bounded.
- Tightening the transport mutex must not serialize legitimate stop→play
  sequences; use a chainable promise, not a hard lock.
