# Device Bridges for Audio Playback & Recording Documentation — Spec

## Context

OpenBand uses a zero-knowledge frontend desktop bridge (`src/bridge/`) supporting Electron (`electron.ts`), Tauri (`tauri.ts`), and Browser (`browser.ts`) environments, combined with universal audio systems (`universalAudio.ts`, `expo-audio`). To make the audio playback and recording device bridge architecture fully transparent and documented for developers, we need a dedicated interactive documentation page (`docs/device-bridges.html`).

## Objectives

- Build `docs/device-bridges.html` as a standalone interactive developer guide explaining audio device enumeration, hardware channel routing (`patchbay`), recording options, and cross-platform bridge adapters.
- Archive spec and verify architecture compliance via `graph:ci`.

## Success Criteria

- `docs/device-bridges.html` created successfully with dark theme and clear architecture diagrams/tables.
- Graph validation passes cleanly.
