# Native Builds (Android + Electron Desktop)

## Overview
OpenBand ships to web, desktop (Electron), and Android. This spec captures the **native build scaffolding** — the reproducible commands, signing fallback, and artifact outputs that let any contributor produce a release APK or Electron distributable — plus the **bridge chain** that makes device-correct audio/hardware work off-web. A full `android/` Expo prebuild and an `electron/` `electron-builder` project exist in the repo; the build configs and documentation are complete and config-coherent, but **no release artifact has actually been produced** in this environment (full Gradle toolchain and Electron-binary downloads are env-limited). iOS is out of scope (requires an Apple identity).

The bridge habitability work is shipped: the `NativeBridge` desktop contract now includes the hardware I/O methods, Electron delegates them over IPC, and the browser/Tauri shells degrade safely. Device-path audio recording (via `expo-audio` `AudioRecorder`) and real-device verification are **NOT yet implemented**.

## Implementation Notes

**`BUILD.md` (repo root)** is the canonical, per-platform build reference. It documents the platform matrix, prerequisites, exact commands, signing notes (debug vs release fallback), artifact output paths, and the desktop bridge chain.

**Android prebuild (`android/`)** is a complete Expo prebuild Gradle project: `settings.gradle`, `android/app/build.gradle`, `android/app/src/main/java`, `android/app/src/main/AndroidManifest.xml`, and `android/app/debug.keystore` (`android/app/debug.keystore`) are present. Release output runs `cd android && ./gradlew assembleRelease`, landing at `android/app/build/outputs/apk/release/app-release.apk`. If absent, `android/local.properties` must point `sdk.dir` at the local Android SDK (documented in BUILD.md; not present in this env).

**Signing fallback (`android/app/build.gradle`)** — `signingConfigs` declares `debug` (always `android/app/debug.keystore`, password `android`) and `release`. `release` uses the real keystore at `android/.secrets/android-keystore.p12` **when it exists**, otherwise **falls back to the debug keystore** so a local `assembleRelease` always succeeds for verification. `buildTypes.release.signingConfig = signingConfigs.release`. To ship a genuinely signed artifact, place a production keystore at `android/.secrets/android-keystore.p12` and re-run.

**Electron package (`electron/package.json`)** — declares `build:electron`, `build:linux`, `build:mac`, `build:win` (all via `electron-builder`) with `appId: com.openband.desktop`, `productName: OpenBand`, and `files: ["main.js", "preload.js", "../dist/**/*", "../assets/**/*"]`. Output lands in `electron/out/`. The **prerequisite** is the root web bundle: run `npm run build` first so `dist/` exists before `electron-builder` (consumed per root `scripts.post-export.js`).

**Desktop bridge chain** — all native desktop I/O flows through one contract:
`OpenBandNative` (`src/bridge/index.ts`) → `detectBridge()` picks `electronBridge` (`src/bridge/electron.ts`) when `window.electronAPI` exists, else `tauriBridge` / `browserBridge` → `electronBridge` delegates to `window.electronAPI` (`electron/preload.js` `contextBridge`) → `ipcMain.handle(...)` in `electron/main.js`. Dialog/project methods (`showOpenDialog`, `showSaveDialog`, `readFile`, `writeFile`, `getDocumentsPath`, `getAppDataPath`, `listProjects`, `saveProject`, `loadProject`, `deleteProject`, `onMenuAction`, `removeMenuActionListener`) plus the hardware methods are implemented end-to-end.

**Hardware I/O native fast path** — `src/lib/hardwareIO.ts` is no longer web-only. Off-web, each device-facing function consults `OpenBandNative` via a `nativeSupports(method)` gate: `enumerateAudioDevices()` calls `OpenBandNative.enumerateAudioDevices()` and maps `BridgeAudioDevice` into `patchState`; `openHardwareInput()` / `closeHardwareInput()` delegate; `createPatchRoute` / `removePatchRoute` best-effort persist through the bridge; `getPatchbayState()` hydrates once from `OpenBandNative.getPatchRoutes()`. On web, the `getUserMedia` / `navigator.mediaDevices.enumerateDevices()` path is unchanged. `src/bridge/electron.ts` delegates the six methods to `window.electronAPI`; `tauri.ts` mirrors them as warn-and-empty stubs; `browser.ts` is the no-op fallback. On Electron the bridge returns real device lists via `node-audiodevice` when available, else `[]`.

**Smoke tests** — deterministic off-web coverage ships in `tests/nativeBridge.test.ts` (electron delegate + browser fallback) and `tests/hardwareIONative.test.ts` (`hardwareIO` delegates off-web).

**Device-path recording — NOT implemented.** The web path (`AudioWorklet` + `getUserMedia` via `hardwareIO.openHardwareInput`) is implemented and tested in the `audio-recording` change. The device path (`Platform.OS === "web"` branch → else `expo-audio` `AudioRecorder` writing into an armed `TrackDef`) is **NOT implemented** and is documented as a limitation. The native `hardwareIO` bridge path is in place so a future device recorder can persist routes through `OpenBandNative`.

## Requirements

### Requirement: BUILD.md Documentation
The system MUST ship a repo-root `BUILD.md` documenting, per platform: prerequisites (Node + deps, Android SDK / `android/local.properties`, `npm run build` before Electron), exact commands (`cd android && ./gradlew assembleRelease`, `cd electron && npm install && npm run build:<target>`), signing notes (debug vs release keystore fallback), artifact output paths, and the desktop bridge chain.

#### Scenario: Read Electron build steps
- **Given** `BUILD.md` at repo root
- **Then** it lists `cd electron && npm run build:linux` (AppImage + deb), `build:mac` (dmg), `build:win` (nsis)
- **And** it notes the web-bundle prerequisite (`npm run build` producing `dist/`)
- **And** it documents output as `electron/out/`

#### Scenario: Read Android signing fallback
- **Given** `BUILD.md` documents signing
- **Then** it states `signingConfigs.release` uses `android/.secrets/android-keystore.p12` when present and falls back to the debug keystore otherwise
- **And** it notes users place a production keystore at that path for a signed release

### Requirement: Android Release Signing Fallback
`android/app/build.gradle` MUST declare `signingConfigs.release` that points `storeFile` at `android/.secrets/android-keystore.p12` **when it exists** and otherwise falls back to `android/app/debug.keystore`, so a local `assembleRelease` always succeeds for verification without `gradle.properties` keystore edits. `release` build type MUST use `signingConfigs.release`.

#### Scenario: Release keystore present
- **Given** `android/.secrets/android-keystore.p12` exists
- **When** `assembleRelease` is configured
- **Then** `signingConfigs.release` uses `storeFile` of that keystore
- **And** `buildTypes.release.signingConfig = signingConfigs.release`

#### Scenario: Release keystore absent
- **Given** no `android/.secrets/android-keystore.p12`
- **When** a local `assembleRelease` runs
- **Then** `signingConfigs.release` falls back to the debug keystore
- **And** the release build still succeeds for verification

### Requirement: Electron Build Scripts
`electron/package.json` MUST expose `build:electron`, `build:linux`, `build:mac`, and `build:win` via `electron-builder`, with `appId: com.openband.desktop`, `productName: OpenBand`, and a `files` list that includes the built web bundle (`../dist/**/*`).

#### Scenario: Scripts present
- **Given** `electron/package.json`
- **Then** `build:linux` = `electron-builder --linux`
- **And** `build:mac` = `electron-builder --mac`
- **And** `build:win` = `electron-builder --win`

### Requirement: Desktop Bridge Chain
On desktop, all native I/O MUST flow `OpenBandNative → detectBridge() → electronBridge → window.electronAPI (preload) → ipcMain.handle (main)`. The dialog, project, menu, and hardware I/O methods MUST be delegating end-to-end, with `tauri.ts` and `browser.ts` as safe fallbacks.

#### Scenario: Electron dialog
- **Given** the Electron shell exposes `window.electronAPI`
- **When** `OpenBandNative.showOpenDialog(...)` is called
- **Then** it resolves through `electronBridge` → `window.electronAPI` → IPC

#### Scenario: Non-Electron fallback
- **Given** no `window.electronAPI`
- **When** a bridge method is invoked
- **Then** `browser.ts` no-ops / `tauri.ts` warns and returns empty
- **And** it does not crash

### Requirement: HTML5 Flag — Hardware Off-Web Fast Path
Off-web, `src/lib/hardwareIO.ts` MUST delegate to `OpenBandNative` via a `nativeSupports(method)` gate (a fast path for `enumerateAudioDevices`, `openHardwareInput`/`closeHardwareInput`, `createPatchRoute`/`removePatchRoute`, and `getPatchbayState` hydration), preserving the web `getUserMedia`/`enumerateDevices` path otherwise.

#### Scenario: Native fast path
- **Given** an off-web platform whose bridge exposes the method
- **When** `enumerateAudioDevices()` is called
- **Then** `OpenBandNative.enumerateAudioDevices()` is awaited
- **And** its `inputs`/`outputs` populate `patchState`

#### Scenario: Web path
- **Given** web
- **When** `enumerateAudioDevices()` is called
- **Then** it continues using `navigator.mediaDevices.enumerateDevices()`

### Requirement: NativeBridge Hardware Methods
`src/bridge/interface.ts` MUST declare `BridgeAudioDevice` / `BridgeHardwareChannel` / `BridgePatchRoute` and the methods `enumerateAudioDevices`, `openHardwareInput`, `closeHardwareInput`, `createPatchRoute`, `removePatchRoute`, `getPatchRoutes`, each implemented in `electron.ts` (delegating to `window.electronAPI`), stubbed in `tauri.ts`, and no-oped in `browser.ts`.

### Requirement: Release APK artifact execution — NOT IMPLEMENTED
A real `cd android && ./gradlew assembleRelease` producing `android/app/build/outputs/apk/release/app-release.apk` is **NOT executed** in this environment (SDK toolchain / time limits). The command, signing fallback, and output path are documented and config-coherent, but no release APK artifact has been produced nor confirmed.

#### Scenario: Full Gradle run — not executed
- **Given** the Android SDK and toolchain
- **When** `cd android && ./gradlew assembleRelease` runs
- **Then** `android/app/build/outputs/apk/release/app-release.apk` is expected
- **NOTE:** not yet executed/confirmed

### Requirement: Electron distributable execution — NOT IMPLEMENTED
An actual `cd electron && npm run build:linux` (or `:mac` / `:win`) producing `electron/out/OpenBand-*.AppImage` / `*.deb` (or dmg/exe) is **NOT executed** in this environment (`electron-builder` fetches the Electron binary). The config and command are coherent, but no distributable has been produced nor verified.

### Requirement: Device-path recording — NOT IMPLEMENTED
Recording on device (`Platform.OS !== "web"` → `expo-audio` `AudioRecorder` writing into an armed `TrackDef` region) is **NOT implemented**. Only the web `AudioWorklet` + `getUserMedia` path is implemented/tested. Persistence of a device-recorded region into the mix is likewise not verified.

#### Scenario: Record on native device
- **Given** the app runs on a native shell (not web)
- **When** recording starts
- **Then** `AudioRecorder` capture is expected
- **And** the take is written into the armed `TrackDef` region
- **Not** implemented

### Requirement: Real-device bridge verification
Manual verification of the desktop bridge dialogs/project save-load and of a device install (`app-release.apk`) playing/recording without `navigator.mediaDevices` crash is **NOT exercised** in a real shell. It requires a produced APK (see the release-APK requirement above) plus a device/shell run.

### Requirement: Hardware device list inside Electron
`hardwareIO` returning a real device list inside Electron relies on the `node-audiodevice` binding; when the binding is unavailable the bridge falls back to `[]`.

#### Scenario: Native naming via node-audiodevice
- **Given** the Electron shell has the `node-audiodevice` binding
- **When** `enumerateAudioDevices()` is called off-web via the bridge
- **Then** real input/output device lists are returned
- **And** `patchState.inputDevices` / `outputDevices` are populated

#### Scenario: binding absent
- **Given** no `node-audiodevice` binding
- **When** `enumerateAudioDevices()` is called off-web
- **Then** the bridge falls back to `[]` without crashing

## Test Requirements (Vitest)
- [x] `tests/nativeBridge.test.ts`: Electron `electronBridge` delegates to `window.electronAPI`; `browserBridge` is the no-op fallback
- [x] `tests/hardwareIONative.test.ts`: `hardwareIO` functions delegate off-web via `nativeSupports` to `OpenBandNative` and return empty on no-op
- [ ] Native recording path (`Platform.OS !== "web"` → `expo-audio` `AudioRecorder`) produces a tracked region -> **not implemented**