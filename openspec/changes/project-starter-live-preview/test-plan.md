# Test Plan: V9-01 — Project Starter Live Preview

## 1. Unit Tests (`tests/projectPreview.test.ts`)
- `calculateEffectivePreviewBars`:
  - 8 bars -> 4 preview bars
  - 16 bars -> 4 preview bars
  - 2 bars -> 2 preview bars
  - 0 or negative bars -> clamped to 1..4
- `normalizeVolumeGain`:
  - `undefined` -> 1.0
  - 80 -> 0.8
  - 100 -> 1.0
  - 0 -> 0.0
  - 0.5 -> 0.5
  - negative / >100 -> clamped safely
- `computePreviewFingerprint`:
  - Changing `genreId`, `mood`, `bpm`, `key`, `timeSignature`, or `previewBars` produces different fingerprint.
  - Changing `name` produces identical fingerprint (name does not affect audio).
- `generatePreviewTracks`:
  - Returns valid TrackDef array for all 13 genres with MIDI notes within the preview duration.

## 2. Concurrency & Lifecycle Tests (`tests/useProjectPreview.test.ts`)
- Rapid configuration changes (20 rapid BPM updates) collapse into 1 pending render.
- Outdated render resolving after newer render is revoked and ignored.
- Unmount revokes active blob URL, clears pending debounce timers, and causes zero memory leaks.
- Error during render sets error state and allows "Criar sem prévia" without throwing.

## 3. UI & Integration Tests (`tests/newProjectPreview.test.tsx`)
- Preview player only visible in `details` step (not `genre` or `mood` steps).
- Start From Scratch does not trigger preview render.
- Initial state is `idle`; clicking Play triggers render and transition to `playing`/`ready`.
- Double-clicking "Criar Projeto" fires `onCreate` exactly once with full `numBars`.
