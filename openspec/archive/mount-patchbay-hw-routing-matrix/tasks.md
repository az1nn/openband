# Tasks: mount-patchbay Hardware I/O Routing Matrix

Status: **IMPLEMENTED & TESTED** (documented retroactively). All implementation
tasks below are checked — the feature ships today. Open items (G1–G3) are
tracked for follow-up, not for this archival.

## Implementation (shipped)

- [x] 1. Declare bridge contract — `enumerateAudioDevices`,
      `openHardwareInput`, `createPatchRoute`, `removePatchRoute`,
      `getPatchRoutes` in `src/bridge/interface.ts` (lines 59-71) plus
      `BridgeAudioDevice` / `BridgeHardwareChannel` / `BridgePatchRoute`
      types (lines 20-44).
- [x] 2. Implement Electron delegation — `src/bridge/electron.ts` (lines 69-97)
      forwards via `requireAPI()`.
- [x] 3. Add no-op fallbacks — `src/bridge/browser.ts` (lines 145-166) +
      `src/bridge/tauri.ts` (lines 74-104) warn-and-resolve.
- [x] 4. Expose via context bridge — `electron/preload.js` (lines 22-29)
      forwards all six IPC channels on `electronAPI`.
- [x] 5. Implement IPC handlers — `electron/main.js:296-348`:
      - `patch-routes.json` persistence helpers (`readPatchRoutes`,
        `writePatchRoutes`).
      - `enumerate-audio-devices` → `loadNativeAudioDevices()`
        (`node-audiodevice`).
      - `open-hardware-input` / `close-hardware-input` → `activeHardwareInput`
        sentinel.
      - `create-patch-route` / `remove-patch-route` / `get-patch-routes`.
- [x] 6. Implement bridge adapter — `src/lib/hardwareIO.ts`:
      - `enumerateAudioDevices()` (web MediaDevices + desktop native).
      - `getHardwareChannels()` channel derivation.
      - `openHardwareInput()` / `closeHardwareInput()` web MediaStream + desktop.
      - `createPatchRoute()` local append + native fire-and-forget.
      - `removePatchRoute()` local filter + native fire-and-forget.
      - `getPatchbayState()` lazy one-shot native hydration, deep-clone return.
- [x] 7. Implement UI — `src/components/Patchbay.tsx` (188 lines): drag-drop
      matrix, device list, channel list, route chips, gain/toggle per route.
- [x] 8. Wire into studio — `app/studio/StudioModals.tsx:282` modal mount;
      `app/studio/[id].tsx:1638` palette button `studio.toolPatchbay`.
- [x] 9. Add tests — `tests/patchbay.test.tsx` (174 lines, 5 cases):
      - hidden when not visible; renders matrix; renders track drop targets;
      - lists channels on device click; creates route on drop; removes route
        via chip press.

## Verification (passing)

- [x] 10. Run targeted vitest — `npx vitest run tests/patchbay.test.tsx`
       → 5/5 passing.
- [x] 11. Run full vitest suite — `npx vitest run` (no regressions).
- [x] 12. Run legacy node:test — `npm run test:legacy` (no regressions).
- [x] 13. Type-check main app — `npx tsc --noEmit` (bridge types resolve).
- [x] 14. Type-check backend — `cd backend && npx tsc --noEmit`.

## Residual (open — post-S11 / follow-up)

- [ ] G1. Duplicate route prevention: dedup `createPatchRoute` on
      `source+targetTrackId+targetChannel` before append (local + native side).
- [ ] G2. Dangling-target cleanup: on `getPatchRoutes` hydration, drop routes
      whose `targetTrackId` ∉ active `trackIds`.
- [ ] G3. Reintroduce warn-level logging on native enumeration / CRUD failure
      (currently `.catch(() => {})` and swallowed enumeration errors).
- [ ] G4. Atomic `patch-routes.json` write (write-temp + rename) to avoid
      corruption on process crash mid-write.
- [ ] G5. Add `patch-routes.json` schema version field + migration stub for
      future `BridgePatchRoute` shape changes.
