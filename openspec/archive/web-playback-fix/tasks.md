# Tasks: Web Playback — No Sound & App Freeze

> **Status: SHIPPED** — all implementation items are complete. The Web Worker
> stem-renderer item was **SUPERSEDED** by a main-thread `renderTracksCached`
> JSON-keyed cache (no worker was required to fix the freeze). Source of truth
> for the shipped behavior is `openspec/specs/audio-transport.md` §3.1.1 / §3.1.2.

## Phase 2 — Implemented

### A. Gesture-safe audio context
- [x] `resumeForGesture()` added to `UniversalAudioSystem` in
      `src/lib/universalAudio.ts:297` — resumes without awaiting, never throws,
      web-only.
- [x] Guard: `resumeForGesture()` bails when the ctx already exists and is
      `running`; `initialize()` does not re-create an already-resumed ctx.

### B. Feed no-sound fix (`app/tabs/index.tsx` + `src/lib/constants.ts`)
- [x] `preloadPreview(id, duration)` / `getCachedPreview(id)` added to
      `src/lib/constants.ts:90,94` (module cache of blob URLs).
- [x] Feed triggers `preloadPreview` on post load / render (`app/tabs/index.tsx:138-139`)
      so the URL is ready before tap.
- [x] `handlePlay` (`app/tabs/index.tsx:189`) calls `audioSystem.resumeForGesture()`
      synchronously before any `await`; uses the cached URL (`getCachedPreview`,
      `:203`); surfaces play errors instead of silently swallowing.
- [x] `src/hooks/useWebAudioPlayer.ts:114-117` — `play()` awaits `audio.play()`
      with no silent catch, so autoplay rejections propagate (tap-to-retry).

### C. Studio no-sound + freeze fix (`app/studio/hooks.ts` + engine)
- [x] `audioSystem.resumeForGesture()` called at the start of `togglePlay`
      (`hooks.ts:645`, before any await).
- [x] Reuse `renderTracksCached` (existing JSON-keyed cache, `hooks.ts:52`) for
      engine stems; only rebuild when the signature changes (`hooks.ts:680`,
      `app/studio/[id].tsx:624`).
- [x] **SUPERSEDED —** `src/lib/renderWorker.ts` was **not** created. The freeze
      fix was achieved on the main thread via the `renderTracksCached` JSON-keyed
      cache, which avoids re-rendering per-track `OfflineAudioContext` stems on
      every `togglePlay`. No Web Worker was needed; the cache satisfies the
      freeze-avoidance requirement without SharedArrayBuffer/CSP concerns.
      (Cross-referenced in `openspec/changes/docs-reconciliation/design.md:47`.)
- [x] `PlaybackEngine.prepare()` continues to accept the cached/pre-rendered
      buffer URL from `renderTracksCached`; main-thread render is the shipped path.
- [x] Playhead throttling: per-tick updates go through `playheadStore`
      (`src/lib/playheadStore.ts` — `getPlayheadBeat`/`setPlayheadBeat`/
      `subscribePlayhead`), consumed via subscription in `app/studio/[id].tsx:89`;
      `setCurrentBeat` removed from the tick hot path so only the playhead display
      re-renders.
- [x] `src/components/LiveWaveformCanvas.tsx` rAF confirmed already locally scoped.

### D. Specs update
- [x] Autoplay-compliance + freeze-avoidance Test Requirements added to
      `openspec/specs/audio-transport.md` §3.1.1 / §3.1.2.

### E. Tests (vitest, `tests/webPlayback.test.ts` + transport)
- [x] `resumeForGesture()` resumes a suspended ctx, returns ctx, never throws.
- [x] `handlePlay` ordering: `resumeForGesture()` / `play()` invoked before
      awaited `generatePreviewUrl` resolves.
- [x] `togglePlay` does not synchronously `new OfflineAudioContext` on the main
      thread during the call (render delegated to the `renderTracksCached` cache).
- [x] Clock tick updates only the playhead component (`playheadStore` test),
      heavy child render count stays 1.
- [x] `useWebAudioPlayer.play()` rejects when called without user activation.

## Remaining
- None. All items shipped with the documented `renderWorker.ts` deviation above.