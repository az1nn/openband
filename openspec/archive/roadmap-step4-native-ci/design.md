# Roadmap Step 4: Native Desktop Build Pipeline & CI Automation — Design

## Architecture
- **CI Pipeline (`.github/workflows/ci.yml`)**: Runs graph validation (`graph:ci`), TypeScript checks, Vitest suite, legacy node:tests, and production web/desktop builds.
- **Electron Builder**: Configures NSIS (Windows), DMG (macOS), and AppImage (Linux) targets with secure contextBridge isolation.
- **Bridge Security**: Verifies `electron/preload.js` exposes only authorized `OpenBandNative` methods (`showOpenDialog`, `saveProject`, etc.).
