# Design: V8 Round B — Native Artifact Pipelines & Native Audio Recording

## 1. Android Artifact Pipeline (V8-04)
- Verify `android/app/build.gradle` signingConfigs.release falls back correctly to `debug.keystore`.
- Document build invocation in `BUILD.md`.

## 2. Electron Artifact Pipeline (V8-05)
- Verify `electron/package.json` build scripts for Linux (`build:linux`) produce AppImage/deb.

## 3. Native Audio Recording (V8-06)
- Update `src/lib/universalAudio.ts` to implement native recording using `expo-audio`'s `AudioRecorder`.
- Flow:
  - `startRecording()` checks platform and re-entrancy guard.
  - On non-web (`Platform.OS !== "web"`), instantiates `new AudioRecorder({ ... })` (or `expo-audio` recording API).
  - `stopRecording()` stops recording, retrieves recorded URI and duration.
  - Commits recorded URI as an audio region into the active track (`TrackDef`).
- Preserve web path (`getUserMedia` + `AudioWorklet`) unchanged.
- Add unit/regression tests for native recording state machine and track commit.
