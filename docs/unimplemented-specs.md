# Unimplemented / Outstanding Items

This file lists only genuinely open work, reconciled against the current repo state on **2026-08-06**. `docs/pending-implementations.md` is the **authoritative** tracker for implemented items; cross-check any "unimplemented" claim here against code and that file before acting. Legend: `[ ]` = open.

---

## 1. i18n completeness (`openspec/changes/i18n-completeness`) — DONE
Shipped: `studio`, `mastering`, `explorer`, `mixer` namespaces added to `src/locales/{en,pt,es}.json`; migrated `app/studio/[id].tsx` (+ hooks/parts/StudioModals), `app/mastering/index.tsx` + `Mastering{Suite,Chain,VersionManager,Upload}` + `LufsMeter`, `app/explorer.tsx`, `app/mixing-console.tsx`; `app/tabs/feed.tsx` re-exports the migrated `index.tsx`; `tests/i18n-coverage.test.ts` added (deep key parity, per-namespace growth, hardcoded-string leak scan). See `openspec/specs/i18n/spec.md`.

## 2. Native builds (`openspec/changes/native-builds`) — MEDIUM
Implementation pass (scaffolding, signing fallback, bridge chain, smoke tests, `BUILD.md`) is shipped; only the document runs and real-device verification remain open.
- [ ] Run `cd android && ./gradlew assembleRelease` and confirm `android/app/build/outputs/apk/release/app-release.apk` is produced (Gradle toolchain / SDK not available here).
- [ ] Run `cd electron && npm run build:linux` and confirm `electron/out/` distributables exist.
- [ ] Device-path recording: `Platform.OS !== "web"` branch using `expo-audio` `AudioRecorder` writing into an armed `TrackDef` region (native `hardwareIO` bridge path is in place).
- [ ] Verify a device-recorded region persists into the mix (blocked on the device path).
- [ ] Real-device/shell verification: Electron dialogs + save/load through `OpenBandNative`; Android installs APK and plays/records without `navigator.mediaDevices` crash; `hardwareIO` returns a real device list in Electron.

## 3. Vercel performance P2 (`openspec/changes/vercel-performance`) — LOW
P0 + P1 shipped (`1026fb8`); only the gated P2 work remains.
- [ ] Code splitting: `web.output: "static"` + `unstable_settings` client-only on data-driven routes, OR Metro `asyncRoutes` (gate: build + vitest + Playwright smoke; else revert and rely on P0/P1).
- [ ] SW precache of hashed entry JS/CSS in the service worker.
- [ ] Housekeeping: remove `@react-three/fiber`/`@react-three/drei` (confirm `zustand` explicit dep first), compress `assets/icon.png`/`icon-512.png`, remove unreferenced `public/logo-openband.png`.

## 4. Roadmap V3 remaining (`openspec/changes/roadmap-v3`) — LOW
M1–M3 fully shipped; M4 has shell + bridge shipped but bundle not compiled.
- [ ] M4: compile and verify the Desktop App bundle (deferred/blocked — see `openspec/specs/native-builds/spec.md`).
- [ ] M5: refactor remaining UI components to `useTranslation` — **deferred** to `i18n-completeness`.

## 5. Plugin test coverage (`openspec/changes/document-plugin-specs`) — LOW
Spec scaffolding shipped; per-plugin Vitest coverage gaps remain.
- [ ] Add Vitest for `eq.ts`, `gate.ts`, `autopitch.ts`, `mbcomp.ts`, `tplimiter.ts`, `LufsMeter`, `MixManager`, `VisualEQ`.
- [ ] Coverage target: each of 19 plugin files has ≥ 3 cases (~60 new tests), `npx tsc --noEmit` clean.

## 6. Immersive studio avatar palette (`openspec/specs/immersive-studio`) — LOW
- [ ] Wire `src/lib/habboAssets.ts` into a screen — depots only experimental color constants; no screen imports it (confirmed via grep). Model-building logic, screen wiring, and avatar system remain future work.
- [ ] 3D scene improvement work is tracked in `docs/3d-scene-guidelines.md` (T1–T10 target playbook: post-processing, IBL, procedural quality tiers, avatar sync, headless invariants) — none implemented yet.