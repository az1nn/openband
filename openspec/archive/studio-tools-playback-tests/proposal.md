# Studio Tools and Device Playback Bridge Tests — Spec

## Context

OpenBand supports multi-environment execution (Electron desktop, Tauri desktop, and Web browser) routed through `src/bridge/` (`OpenBandNative`), alongside advanced DAW studio tools (Synth, Sampler, Looper, Patchbay, MasteringSuite, etc.) and cross-platform audio playback (`universalAudio`, `expo-audio`).

To ensure high reliability across devices and environments, we need a dedicated test suite verifying:
1. Bridge environment detection and fallback behavior (Electron, Tauri stub, Browser fallback).
2. Studio tools state initialization and parameter routing.
3. Audio playback engine behavior across device capabilities.

## Objectives

- Add unit test suite `tests/studioToolsPlaybackDevice.test.ts` covering bridge environment switching (Electron / Tauri / Browser), device capability detection, and studio tool actions.
- Verify robust cross-platform fallback handling for native APIs (`showOpenDialog`, `readFile`, `enumerateAudioDevices`, etc.).
- Run full test suite and graph CI validation.

## Success Criteria

- `tests/studioToolsPlaybackDevice.test.ts` passes successfully with Vitest.
- `npm run graph:ci` passes with zero errors.
- TypeScript type check (`tsc`) passes.
