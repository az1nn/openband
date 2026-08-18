# Design: Audio & Recording Correctness Fixes

## Status: SHIPPED
> H1–H3, M4–M15). Each section gives Current vs New with a code sketch and a
> file-change table.

## 1. WAV 24-bit encoders (H1)

### Current
`src/lib/universalAudio.ts` `float32ToWavBlob` (`:606`) and `audioBufferToWavBlob`
(`:647`) always do `view.setInt16(offset, val, true)` regardless of `bitDepth`.
Callers pass `24`: `renderMixdownWeb` `:363`/`:410`, `renderMixdownNative` `:488`.
Header says 24-bit, samples are 16-bit at a 3-byte stride → gaps/corruption.
`app/studio/hooks.ts` `applyPitchShift` (`:477`) calls
`audioBufferToWavBlob(rendered)` with no depth (imports the correct encoder from
`src/lib/audio.ts:71`, default 16 — works today but is implicit).

### New
Branch on `bitDepth` and write true 3-byte samples (mirror the good encoder at
`src/lib/audio.ts:91-107`):

```ts
// inside the sample loop of both encoders:
const offset = headerSize + (i * numChannels + ch) * bytesPerSample;
if (bitDepth === 24) {
  const pcm = Math.max(-8388608, Math.min(8388607, Math.round(sample * 8388607)));
  view.setInt8(offset, pcm & 0xff);
  view.setInt8(offset + 1, (pcm >> 8) & 0xff);
  view.setInt8(offset + 2, (pcm >> 16) & 0xff);
} else {
  const val = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  view.setInt16(offset, val, true);
}
```

`applyPitchShift` (`:477`) → `audioBufferToWavBlob(rendered, 16)` (explicit).

| File | Change |
| --- | --- |
| `src/lib/universalAudio.ts` | true 24-bit writing in `float32ToWavBlob` `:606` + `audioBufferToWavBlob` `:647`; `applyPitchShift` explicit `16` |
| `app/studio/hooks.ts` | `applyPitchShift` `:477` passes `16` |

## 2. Per-instance render cache (H2)

### Current
`app/studio/hooks.ts:49-50` module globals `cachedRenderKey`/`cachedRenderUrl`;
`renderTracksCached` `:53-87` returns the shared URL; `applyPitchShift` `:480`
revokes it. Cross-instance reuse + revoke → next render returns a dead blob.

### New
- Add `useRenderCache()` hook (or a `useRef` pair) in `app/studio/[id].tsx` that
  owns `key`+`url` per mounted Studio instance; pass getter/setter into
  `renderTracksCached` (overload or context param).
- On unmount, revoke the held URL. When a URL is revoked (e.g. pitch shift
  rebuild), reset the cached key so the next call re-renders rather than returning
  the revoked URL.

```ts
// in [id].tsx
const renderCacheRef = useRef<{ key: string | null; url: string | null }>({ key: null, url: null });
useEffect(() => () => {
  if (renderCacheRef.current.url) URL.revokeObjectURL(renderCacheRef.current.url);
}, []);
```

| File | Change |
| --- | --- |
| `app/studio/hooks.ts` | `renderTracksCached` accepts an injected cache (per-instance); no module globals |
| `app/studio/[id].tsx` | own the cache via `useRef`, revoke on unmount, invalidate on revoke |

## 3. Isolate monitor context + native clock (H3)

### Current
`latencyMonitor.ts` `createLowLatencyContext` `:35-44` returns
`getSharedAudioContext()`; `disposeLatencySystem` `:169-182` calls
`monitorCtx.close()` → can close the global ctx. `clockManager.ts`
`getAudioContext` `:34-37` returns `null` off-web; `startClock` `:39-48` bails.

### New
- `createLowLatencyContext` builds `new AudioContext()` (web only); falls back to
  null when `AudioContext` undefined. `disposeLatencySystem` closes only that
  dedicated ctx — never the shared one.
- `clockManager.ts` adds a native fallback: when `getAudioContext()` is null,
  drive ticks with `setInterval(25ms)` (or `requestAnimationFrame`) and read time
  from a pluggable `getPlayheadTime()` (fed by `player.currentTime` on native).

```ts
function getAudioContext() {
  if (Platform.OS !== "web") return null;
  return getSharedAudioContext();
}
// startClock: if no ctx, fall back to setInterval ticking getNativePlayhead()
```

| File | Change |
| --- | --- |
| `src/lib/latencyMonitor.ts` | `createLowLatencyContext` `:35` → dedicated ctx; `disposeLatencySystem` `:169` only closes it |
| `src/lib/clockManager.ts` | native `setInterval`/`rAF` clock fallback when no AudioContext `:34-48` |

## 4. Native pan law + MP3 decode (M4, M5)

### Current
`renderMixdownNative` `:438-439` `rightGain = trackGain*(pan>0?1+pan:1)` (biased).
`decodeAudioPureJS` `:494-` returns a sine fallback for MP3/ID3 `:499`/`:601`.

### New
- Unify both branches to equal-power pan:
  `leftGain = trackGain*cos(pan*π/4)`, `rightGain = trackGain*sin(pan*π/4)`
  (or the symmetric linear law used in `:469-470` applied to BOTH branches).
- `decodeAudioPureJS`: add a real MP3 decode path (minimal) OR, when the RIFF/ID3
  container is MP3 and no decoder is available, **throw** `UNSUPPORTED_FORMAT`
  instead of silently faking a tone; callers surface it.

| File | Change |
| --- | --- |
| `src/lib/universalAudio.ts` | `renderMixdownNative` `:438-439` use balanced pan; `decodeAudioPureJS` `:494` real-decode-or-throw |

## 5. Blob URL leak in mixdown (M6)

### Current
`renderMixdownWeb`/`:373` and `renderMixdownNative`/`:448` call
`resolveAssetUrl(region.url)` then `fetch`+`decode`, never revoking the returned
blob URL; `assetCache` (`assetStore.ts:117`) keeps it for the process lifetime.

### New
Build a per-render `Map<id, url>` of resolved blob URLs; after each region decode,
the URL stays alive for the render (shared by regions of the same asset) and is
revoked once at the end of the render pass. Remote (non-`blob:`) URLs are skipped.

| File | Change |
| --- | --- |
| `src/lib/universalAudio.ts` | `renderMixdownWeb` `:373` + `renderMixdownNative` `:448` revoke resolved blob URLs after the pass |
| `src/lib/assetStore.ts` | (optional) expose `isLocalBlob(url)` helper |

## 6. Recording re-entrancy + export revoke + dispose (M7, M8, M9)

### Current
`startRecording` `:146-185` no guard. `exportToFile` `:688-699` revokes after
`a.click()`. Singleton `_audioCtx` closed only by `dispose()` `:736-742`;
`disposeAllAudio` `:95` not called on Studio unmount.

### New
- `startRecording` sets `this.isRecording = true` at start, rejects/early-returns if
  already recording, clears it in `cleanupRecording`/`stopRecording`.
- `exportToFile`: defer `URL.revokeObjectURL` via `setTimeout(…, 1000)` after a
  `click` + `removeChild`, or revoke in the anchor's `click` completion listener.
- Call `audioSystem.dispose()` (or `disposeAllAudio`) in `app/studio/[id].tsx`
  unmount effect.

| File | Change |
| --- | --- |
| `src/lib/universalAudio.ts` | `isRecording` flag in `startRecording` `:146`; deferred revoke in `exportToFile` `:688`; unmount dispose |
| `app/studio/[id].tsx` | dispose audio system on unmount |

## 7. Native stop URI + toggleRecording ref guard (M10, M11)

### Current
`[id].tsx:509` `uri = recorderState?.url ?? audioRecorder.uri` read post-await
with stale React state. `toggleRecording` `:486-612` reads closure `isRecording`.

### New
- Derive the URI from the **result** of `await audioRecorder.stop()` (expo-audio
  returns the recording/uri) or a ref captured at stop time.
- Add `recordingInFlightRef` guard; read latest `tracks` via `tracksRef`
  (already present at `:438`) and `isRecording` via a ref to prevent double-start.

| File | Change |
| --- | --- |
| `app/studio/[id].tsx` | URI from stop result `:509`; `recordingInFlightRef` guard in `toggleRecording` `:486` |

## 8. togglePlay concurrency mutex (M12)

### Current
`hooks.ts` `togglePlay` `:653-715` and `rerenderAfterMuteSolo` `:614-652` run
unserialized; rapid taps start two prepare/play sequences; one render's URL can be
revoked while another in-flight render uses it.

### New
Introduce a module/instance transport mutex (`transportChainRef`): every
transport action appends to a `Promise` chain; guard against unmount by checking a
`disposedRef` mid-await. `rerenderAfterMuteSolo` acquires the same chain so a
revoke cannot interleave with an in-flight play.

```ts
const transportChainRef = useRef<Promise<void>>(Promise.resolve());
const runTransport = (fn: () => Promise<void>) => {
  const next = transportChainRef.current.then(fn).catch(() => {});
  transportChainRef.current = next;
  return next;
};
```

| File | Change |
| --- | --- |
| `app/studio/hooks.ts` | `togglePlay` `:653` + `rerenderAfterMuteSolo` `:614` serialized via `transportChainRef`; unmount guard |

## 9. Latency monitor false "active" (M13)

### Current
`startDirectMonitor` `:67-101` returns `monitorState` even when `stream`/`monitorCtx`
is null; callers set `monitoring = true` regardless.

### New
Return a state with `enabled:false` (and an error field) when mic/ctx unavailable;
only set `enabled:true` on the success path `:94`. Callers check
`monitorState.enabled` before flipping UI `monitoring`.

| File | Change |
| --- | --- |
| `src/lib/latencyMonitor.ts` | `startDirectMonitor` `:67` propagate failure (no false active); `RecordOptions` reads `enabled` |

## 10. Modulation region-relative (M14)

### Current
`renderMixdownWeb` `:380` passes `modTime: region.start` into `applyPluginChain`;
`applySinglePlugin`/modulation (`pluginChain.ts:208`,`:287`) schedules at
`modTime+offset` inside a context sized to the region length → dropped events.

### New
Pass `modTime: 0` and `duration: region.duration` from the render pass so modulation
is region-relative. The committed-time simulation already seeds modulation from
`trackModTime` in `midiSynth.ts:882` (full-song contexts) — those keep `region.start`
because their contexts are song-length; only the `universalAudio` mixdown path needs
the `0` fix.

| File | Change |
| --- | --- |
| `src/lib/universalAudio.ts` | `renderMixdownWeb` `:378-380` pass `modTime: 0`, `duration: region.duration` |

## 11. revertToCommit restores snapshot (M15)

### Current
`stateAssetSeparation.ts` `commitState` `:219-249` computes `stateJson` `:226` but
stores only `stateHash`/`stateRef`; `revertToCommit` `:261-266` returns
`currentProject` unchanged.

### New
- Store `stateJson` on the `ProjectCommit` (add `snapshot?: string` field), set at
  `:226`/`:240`.
- `revertToCommit` deserializes `commit.snapshot` via `deserializeProject` and
  assigns `currentProject` (returns the restored `ProjectState`).

| File | Change |
| --- | --- |
| `src/lib/stateAssetSeparation.ts` | persist `stateJson` on commit `:226`; `revertToCommit` `:261` restores it |

## 12. Test Requirements (to add to `openspec/specs/audio-transport.md` / `audio-system.md`)

- WAV round-trip decode succeeds for both 16-bit and 24-bit (encode → parse header
  `bitDepth` + sample bytes → reconstructed samples within tolerance).
- Per-instance render cache: re-rendering after a revoke produces a fresh, live URL;
  unmount revokes the held URL (no leak).
- Latency monitor uses a **dedicated** context: after `disposeLatencySystem`, the
  shared `getSharedAudioContext()` is still alive/usable.
- Native clock ticks: with no `AudioContext`, `startClock` still fires tick
  listeners (driven by `setInterval`/`rAF`).
- `startRecording` rejects/early-returns on a second concurrent call.
- `togglePlay` mutex: two rapid calls run serialize (single prepare/play), and a
  URL revoked by a later render is not consumed by an earlier in-flight play.
- `revertToCommit` returns the committed snapshot state, not the live project.

## 13. Verification

1. `npx tsc --noEmit`
2. `cd backend && npx tsc --noEmit`
3. `npx vitest run`
4. `npm run test:legacy`
5. `npm run build`
6. `wsl -e bash -lc "cd /home/az1nn/openband && npm run graph:ci"`
