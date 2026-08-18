# Design: V9-01 — Project Starter Live Preview

## 1. Architecture Overview
```
NewProject (Step: details)
   │
   ▼
useProjectPreview hook
   │
   ├── computePreviewFingerprint(config, previewBars)
   ├── generatePreviewTracks(genreId, bpm, key, mood, previewBars, timeSignature)
   ├── renderTracksToUrl(previewTracks, bpm, mood)
   └── useUniversalAudio (Play / Pause / Seek / Stop / Dispose)
```

## 2. Core Modules

### `src/lib/projectPreview.ts`
- `MAX_PREVIEW_BARS = 4`
- `DEFAULT_PREVIEW_VOLUME = 0.7`
- `normalizeVolumeGain(vol?: number): number`:
  - If `vol == null`: returns 1.0 (or default 0.8)
  - If `vol > 1`: returns `Math.max(0, Math.min(1, vol / 100))`
  - If `vol >= 0 && vol <= 1`: returns `vol`
  - Otherwise clamps to `[0..1]`
- `calculateEffectivePreviewBars(numBars: number): number`: returns `Math.min(numBars, MAX_PREVIEW_BARS)`
- `computePreviewFingerprint(config: PreviewConfig): string`: SHA-like or string hash of `genreId:mood:bpm:key:timeSignature:effectivePreviewBars`. Deliberately excludes `name`.
- `generatePreviewTracks(...)`: generates short tracks scaled to `effectivePreviewBars`.

### `src/hooks/useProjectPreview.ts`
- State Machine: `idle` → `rendering` → `ready` → `playing` | `paused` | `error`
- Concurrency & Debounce:
  - Max 1 render in-flight.
  - While render is in-flight, rapid parameter changes update a `pendingConfig` reference.
  - Debounce musical edits by 200ms once preview is activated (`hasActivated`).
  - Stale revision check: discard and revoke any blob URL completed for an outdated revision.
  - Cleanup on unmount / modal close: cancels timers, stops audio, revokes all tracked blob URLs.
  - Auto-play best effort: when an auto-refresh finishes and user was playing, attempt play; if blocked by browser policy, keep state at `ready`.

### `src/components/ProjectPreviewPlayer.tsx`
- Compact audio preview bar rendered inside `NewProject` details step.
- Displays Play/Pause button, loading spinner when rendering/updating, error badge with "Criar sem prévia" fallback button.
- Accessibility labels and distinct testIDs (`project-preview-play-btn`, `project-preview-status`, `project-preview-error`).

## 3. Creation Boundary
- "Criar Projeto" invokes `setupProjectStarter` with full `numBars` (not previewBars).
- If preview is actively rendering or stale, button is temporarily disabled or resolves cleanly with latest config.
- Double-click reentrancy guard ensures `onCreate` is fired exactly once.
