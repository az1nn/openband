# Proposal: V8 Round B — Native Artifact Pipelines & Native Audio Recording

## Context & Problem
While Round A established PR-first governance and parallel CI V2, OpenBand still lacks verifiable native build artifacts and native audio recording on mobile/desktop runtimes (`expo-audio` recording is stubbed with an early return on non-web platforms).

## Objectives
1. **Android Artifact Pipeline (V8-04):** Ensure Gradle build configuration and signing fallback (`debug.keystore` when release keystore is absent) are fully robust for release builds.
2. **Electron Artifact Pipeline (V8-05):** Ensure Electron packaging scripts (`build:linux`) build cleanly and integrate into CI.
3. **Native Audio Recording (V8-06):** Implement cross-platform native audio recording using `expo-audio` `AudioRecorder` in `UniversalAudioSystem`, enabling recording → region commit → mix/playback on mobile and desktop platforms while preserving the web path.
