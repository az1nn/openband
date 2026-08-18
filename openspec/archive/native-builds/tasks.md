# Tasks — Native Builds

> **Status:** The implementation pass (build scaffolding, signing fallback, bridge chain, smoke tests, `BUILD.md`) is **shipped** — see `openspec/specs/native-builds/spec.md`. This file tracks only the **open** items: executing the document runs and real-device verification.

## 1. Android release artifact
- [x] Verify `android/` prebuild is intact (`android/app/src/main/AndroidManifest.xml`, `android/app/build.gradle`, `android/gradlew`)
- [x] Configure signing fallback: `signingConfigs.release` in `android/app/build.gradle` uses `android/.secrets/android-keystore.p12` when present and **falls back to `debug.keystore`** otherwise, so a local `assembleRelease` always succeeds for verification
- [x] Ensure `android/local.properties` points `sdk.dir` at the local Android SDK if absent (documented in BUILD.md; not present in this env)
- [ ] **OPEN:** Run `cd android && ./gradlew assembleRelease` — documented command + config-coherent; NOT executed here (full Gradle toolchain / SDK unavailable) — **BLOCKED (probed 2026-08-10): no JDK/Gradle in WSL (`java`/`gradle` not found, `JAVA_HOME` empty), no Android SDK (`ANDROID_HOME`/`ANDROID_SDK_ROOT` unset; `~/Android/Sdk`, `/usr/lib/android-sdk`, `/opt/android-sdk` all absent), and `android/local.properties` `sdk.dir=/tmp/android-sdk` points at a directory that does not exist. `./gradlew` cannot execute without Java.**
- [ ] **OPEN:** Confirm `android/app/build/outputs/apk/release/app-release.apk` is produced — not confirmable; blocked by missing JDK/SDK above

## 2. Electron desktop artifact
- [x] Root `npm run build` documentation confirmed; `dist/` is the consumed input (documented in BUILD.md)
- [x] `cd electron && npm install` + `npm run build:linux` (AppImage + deb) documented in BUILD.md
- [x] `electron/package.json` `build:linux/mac/win` scripts confirmed present and coherent
- [ ] **OPEN:** Run `cd electron && npm run build:linux` — documented command + config-coherent; NOT executed (`electron-builder` fetches the Electron binary) — **ATTEMPTED (probed 2026-08-10): electron 35.7.5 binary downloaded and `out/linux-unpacked` packaged, then electron-builder died on a 600 s `Timeout awaiting 'request'` (network) fetching the next artifact. No `.deb`/`.AppImage` produced in this sandbox. PASS when a full run completes.**
- [ ] **OPEN:** Confirm `electron/out/` distributables exist — not confirmable; run above failed before `.deb`/`.AppImage` were written (only `out/linux-unpacked/` exists)

## 3. Device-path audio recording
- [x] Web path (`AudioWorklet` + `getUserMedia` via `hardwareIO.openHardwareInput`) implemented and tested in `audio-recording` change
- [ ] **OPEN:** Device path — `Platform.OS !== "web"` branch uses `expo-audio` `AudioRecorder` writing into an armed `TrackDef` region; the native `hardwareIO` bridge path is in place so a future recorder can persist routes through `OpenBandNative` — **ASSESSED (probed 2026-08-10): no native recording branch exists — `UniversalAudioSystem.startRecording` in `src/lib/universalAudio.ts` early-returns on `Platform.OS !== "web"` (line 147), and grep confirms zero `AudioRecorder`/`expo-audio` recording usage anywhere in `src/`. `expo-audio` (~57.0.0) ships a cross-platform `AudioRecorder` (iOS `AudioRecorder.swift`, Android `AudioRecordingService.kt`, plus web fallback), so the branch is implementable, but it is NOT testable headlessly — actual capture needs a device/emulator; only the armed-region commit logic could be covered by unit tests with a mocked recorder.**
- [ ] **OPEN:** Verify a device-recorded region persists into the mix (blocked on the device path above)

## 4. Real-device / shell manual verification
- [x] Added deterministic smoke tests: `tests/nativeBridge.test.ts` + `tests/hardwareIONative.test.ts`
- [ ] **OPEN:** Electron: launch `npm run desktop` and confirm dialogs + project save/load resolve through `OpenBandNative` → `window.electronAPI` → IPC (manual; covered by smoke test)
- [ ] **OPEN:** (Device) Android: install `app-release.apk` and confirm playback + recording without `navigator.mediaDevices` crash (requires APK build — see §1)
- [ ] **OPEN:** `hardwareIO` returns real device list inside Electron (requires `node-audiodevice` binding; falls back to `[]`) — **ASSESSED (probed 2026-08-10): the JS chain is complete — `hardwareIO.nativeSupports("enumerateAudioDevices")` (src/lib/hardwareIO.ts:51/78) → `OpenBandNative.enumerateAudioDevices` → `src/bridge/electron.ts` → `window.electronAPI` → `ipcMain.handle("enumerate-audio-devices")` (electron/main.js:319) → `loadNativeAudioDevices()`. The only gap is the native binding itself: `node-audiodevice` is NOT declared in `electron/package.json` (only `devDependencies: electron ^35, electron-builder ^26`; `dependencies` is empty), so `require("node-audiodevice")` catches and returns `{ inputs: [], outputs: [] }`. Real enumeration requires installing + natively compiling `node-audiodevice` and running inside a live Electron shell (needs an audio system present). Cannot be verified headlessly.**

## 5. Documentation
- [x] Create `BUILD.md` (repo root): prerequisites, exact commands per platform, signing notes, artifact output paths, desktop bridge chain
- [x] Add a short build-commands note to `AGENTS.md` (optional) — skipped; `BUILD.md` is the canonical reference
- [x] Canonical spec created at `openspec/specs/native-builds/spec.md` capturing shipped + NOT-implemented requirements

## 6. Verification (remaining executable checks)
- [x] `npx tsc --noEmit` (root) adds zero new errors; backend clean
- [x] `cd backend && npx tsc --noEmit` clean (0 errors)
- [x] `npm run test:legacy` passes (24/24)
- [x] Smoke tests `tests/nativeBridge.test.ts` + `tests/hardwareIONative.test.ts` pass
- [ ] **OPEN:** `npx vitest run` full suite green (pre-existing failures unrelated to this change)
- [ ] **OPEN:** `npm run build` succeeds (web bundle) — not executed here
- [ ] **OPEN:** `cd android && ./gradlew assembleRelease` succeeds → APK present (env-limited)
- [ ] **OPEN:** `cd electron && npm run build:linux` succeeds → distributable present (env-limited)

## 7. Archive prior incomplete work
- [x] Carry forward the unfinished `desktop-build` archive task (run checks): backend tsc clean, legacy tests pass, bridge smoke tests added; full native builds documented but not executed due to env limits
- [ ] **OPEN:** Mark `hardware-io-native` and `audio-recording` as completed and archive — pending the device-path recording item (§3) and real-device verification (§4)