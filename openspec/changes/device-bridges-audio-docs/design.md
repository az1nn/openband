# Device Bridges for Audio Playback & Recording Documentation — Design

## 1. Documentation Structure (`docs/device-bridges.html`)
- **Overview**: How OpenBand abstracts native desktop capabilities away from frontend code.
- **Bridge Architecture**: `NativeBridge` interface contract in `src/bridge/interface.ts`, runtime environment detection in `src/bridge/index.ts`.
- **Audio Playback & Recording**: `expo-audio` integration, `UniversalAudioSystem`, sample rate & latency enumeration.
- **Hardware Routing**: Multi-channel patchbay routing matrix (`enumerateAudioDevices`, `openHardwareInput`, `createPatchRoute`).
- **Interactive Layout**: Styled with Tailwind CSS (CDN), responsive grid, and code snippet cards.
