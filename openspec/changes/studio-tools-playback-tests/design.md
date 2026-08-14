# Studio Tools and Device Playback Bridge Tests — Design

## 1. Test Suite Structure (`tests/studioToolsPlaybackDevice.test.ts`)

- **Bridge Environment Testing**:
  - Test `electronBridge` when `window.electronAPI` is available.
  - Test `tauriBridge` stub when `window.__TAURI__` is set (verifying safe console/null returns).
  - Test `browserBridge` fallback when neither desktop environment is present.
  - Test auto-detect logic in `src/bridge/index.ts`.

- **Studio Tools & Playback Integration**:
  - Test studio playback state machine across device environments.
  - Test audio system initialization and cross-platform playback helpers.
  - Test patchbay routing and hardware channel enumeration mocks.

## 2. Implementation Steps
1. Create `tests/studioToolsPlaybackDevice.test.ts`.
2. Run test suite via Vitest.
3. Verify graph architecture and CI compliance.
