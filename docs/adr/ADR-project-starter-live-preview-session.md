# ADR: Project Starter Live Preview Session Architecture

- **Status:** Accepted
- **Date:** 2026-08-18
- **Context:**
  When creating a project via `NewProject`, users select Genre, Mood, and customize BPM, Key, Time Signature, and Bars. They need auditory feedback prior to clicking "Criar Projeto".

- **Decision:**
  Create an ephemeral `ProjectPreviewSession` leveraging existing `generateTracksForGenre` and `renderTracksToUrl` (via `OfflineAudioContext` on Web with fallback).
  - **No temporary project creation:** Preview avoids `projectStore`, Supabase, or cloud sync.
  - **No duplicate audio engine:** Reuses the verified `midiSynth.ts` offline renderer and `useUniversalAudio` player.
  - **Auto-refresh with single in-flight render:** After first explicit Play gesture, subsequent musical adjustments debounce (200ms) and regenerate audio with a max concurrency of 1 (latest-only queue).
  - **Volume normalization:** Standardize `TrackDef.volume` to gain `[0..1]` throughout rendering.

- **Consequences:**
  - Fast feedback loop for users with minimal CPU overhead (rendered only up to 4 bars).
  - Safe memory cleanup with immediate revocation of stale/superseded blob URLs.
  - Full cross-platform compatibility.
