# Tasks: OpenBand V3 Roadmap

> **Status:** M1 (Cloud Sync) and M2 (Audio Recording) are fully shipped. M3 (Advanced MIDI) is fully shipped (snap, velocity, drag-to-resize, and SoundFont all present). M4 (Desktop) has the Electron shell + bridge methods shipped, but the bundle is not compiled/verified. M5 (i18n) has install/dictionaries/provider shipped; the component refactor is **deferred** to the `i18n-completeness` change.

## Milestone 1: Cloud Sync (Supabase)
- [x] Connect Supabase client in `src/lib/supabase.ts` with real credentials.
- [x] Implement `Save to Cloud` logic in `ProjectMenu.tsx` (`handleSaveToCloud` → `saveProjectToCloud`, `src/components/ProjectMenu.tsx:67`).
- [x] Implement `Load from Cloud` logic in the `Library` tab (`fetchCloudProjects`, `app/tabs/library.tsx:139`).
- [x] Verify Auth flow.

## Milestone 2: Audio Recording
- [x] Create `public/worklets/RecordingWorklet.js` (audio-capture AudioWorklet) for low-latency capture.
- [x] Integrate `navigator.mediaDevices` inside `src/lib/universalAudio.ts` (`startRecording` loads the worklet + `getUserMedia`; `stopRecording` concatenates chunks → WAV).
- [x] Add "Arm" button to Track Header in `app/studio/[id].tsx` (`isArmed` toggle, `:1886`).
- [x] Implement Live Waveform visualizer (`LiveWaveformCanvas`, `app/studio/[id].tsx:2053`).
- [x] Convert captured buffers to `.wav` and add to project regions (`float32ToWavBlob` → `createTrackedBlob` → `TrackRegion`).

## Milestone 3: Advanced MIDI
- [x] Rewrite `PianoRoll.tsx` to support Drag-to-Resize notes, Drag-to-Move, and Velocity editing (`resizeRef` handle `:454`, velocity +/- `:519`, drag `:208`).
- [x] Add "Snap to Grid" toggle in the UI (`bar`/`beat`/`16th`, `snapMode` `:139`, `snapValue` `:86`).
- [x] Integrate a SoundFont player (`soundfont-player` → `sfCache`/`preloadSoundfont`/`getTrackSfName`, `src/lib/midiSynth.ts`) for better instrument sounds.

## Milestone 4: Desktop Build
- [x] Initialize Electron project wrapper (`electron/` main + preload).
- [x] Implement Node `fs` and dialog native methods in `src/bridge/electron.ts` (FS, path, dialog, project, hardware methods).
- [ ] Compile and verify the Desktop App bundle — deferred/blocked (see `openspec/specs/native-builds/spec.md`).

## Milestone 5: Internationalization (i18n)
- [x] Install `i18next` and `react-i18next` packages.
- [x] Create translation files for English (`en.json`), Portuguese (`pt-BR/pt.json`), and Spanish (`es.json`) under `src/locales/`.
- [x] Wrap the app root via `src/lib/i18n.ts` (`initReactI18next`, `initI18n`) imported in `app/_layout.tsx` (see `openspec/specs/i18n/spec.md`).
- [ ] Refactor remaining UI components to use the `useTranslation` hook instead of hardcoded strings — **DEFERRED** to `i18n-completeness` (`openspec/changes/i18n-completeness/`).