# Proposal: V9-01 — Project Starter Live Preview

## Context & Problem
In OpenBand's `NewProject` modal, users configure a project template across a three-step wizard (Genre → Mood → Details). In the Details step, they can adjust musical parameters (BPM, Key, Number of Bars, Time Signature). However:
1. Users cannot hear what the generated template sounds like before committing to "Criar Projeto".
2. Adjusting parameters does not give auditory feedback.
3. In `renderTracksToUrl` (`src/lib/midiSynth.ts`), `track.volume` is consumed directly as Web Audio gain without normalizing percentage values (e.g. 80), posing an audio safety and clipping hazard.

## Objectives
1. **Live Preview Session:** Allow users in the Details step to trigger a fast, representative preview (up to 4 bars) of the generated template using `generateTracksForGenre` and `renderTracksToUrl`.
2. **Auto-Refresh on Musical Edits:** Once preview playback has been triggered, modifying musical parameters (Genre, Mood, BPM, Key, Time Signature, effective preview bars) automatically regenerates and updates the preview. Editing project name does NOT trigger preview re-render.
3. **Audio Safety & Gain Normalization:** Normalize `TrackDef.volume` to `[0..1]` across all render paths and clamp preview player volume to ~0.7 to avoid clipping.
4. **Isolated Persistence & Zero Leak:** Ensure preview operations never call `projectStore`, Supabase, cloud sync, or create orphaned projects. Revoke preview blob URLs on replacement, stale completion, and component unmount.
5. **Cross-Platform Parity:** Support both Web (via `OfflineAudioContext`) and native/fallback runtimes cleanly. Start From Scratch remains without preview.
