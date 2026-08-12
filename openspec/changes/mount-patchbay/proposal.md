# Proposal: mount-patchbay Hardware I/O Routing Matrix

## Context

OpenBand is a cross-platform DAW (Expo RN web + Electron desktop). Professional
studio workflow requires routing physical audio hardware (audio interfaces, USB
mics, ADAT preamps, etc.) into project tracks — the classic "patchbay"
metaphor: you plug a source channel into a destination track and gain is
applied on the path.

The HY3 handoff document (`docs/HY3-HANDOFF.md:199`) lists
`mount-patchbay` as an in-flight item under `hardware-io-native`, stating the
bridge methods are added but IPC + UI wiring are needed. Investigation shows the
**entire feature is already implemented**:

- `src/components/Patchbay.tsx` (188 lines) — drag-drop matrix UI.
- `src/lib/hardwareIO.ts` (368 lines) — bridge adapter wrapping the native
  methods with a local reactive `PatchbayState` and lazy one-shot hydration
  from the native store.
- `src/bridge/interface.ts` — `NativeBridge` contract declares
  `enumerateAudioDevices`, `openHardwareInput`, `createPatchRoute`,
  `removePatchRoute`, `getPatchRoutes` plus the typed `BridgePatchRoute`,
  `BridgeHardwareChannel`, `BridgeAudioDevice` payloads.
- `src/bridge/electron.ts` — delegates each to `window.electronAPI`.
- `electron/preload.js` — context-bridge forwards all six IPC channels.
- `electron/main.js:296-348` — IPC handlers backed by
  `patch-routes.json` under `app.getPath("userData")`; device enumeration via
  `node-audiodevice`; `openHardwareInput` records the active device.
- `app/studio/StudioModals.tsx:282` — `Patchbay` mounted as a studio modal,
  toggled from the tool palette (`app/studio/[id].tsx:1638`).
- `tests/patchbay.test.tsx` — 5 vitest cases across visibility, device
  listing, channel expansion, route creation on drop, and route removal.

This spec is the **captured/archival record** of the shipped `mount-patchbay`
feature, recording the wiring that exists so it is not lost to drift and so the
residual gaps (route validation) are made explicit.

## Problem Description

There is **no OpenSpec** entry for `mount-patchbay`: neither
`openspec/changes/mount-patchbay` nor `openspec/archive/mount-patchbay` exists.
The HY3 doc still describes it as pending. A captured spec is needed to:

1. Freeze the implemented data-flow contract so refactors do not silently break
   the bridge boundary.
2. Make explicit the validation gap (duplicate / dangling routes) that today is
   unhandled.
3. Provide the checklist that future work (e.g. the S11 `wire-modulation-matrix`
   effort, which also touches route validation) can consume.

## Objectives

- Document the as-built Patchbay wiring: `Patchbay.tsx` →
  `hardwareIO.ts` → `OpenBandNative` bridge (`electron.ts`) →
  `electron/main.js` IPC, persisted to `patch-routes.json`.
- Record the exact state shape and the native ↔ web device-enumeration
  divergence (MediaDevices API fallback on web, `node-audiodevice` on desktop).
- Mark all implementation tasks as completed (shipped).
- Capture the residual validation gap as explicit open tasks.

## Non-Goals

- No new native audio device driver code. This spec covers UI + bridge + IPC
  glue only; the actual audio driver layer (`node-audiodevice`) is out of scope
  and already stubbed behind `loadNativeAudioDevices()`.
- No cross-platform device-enumeration API changes. The MediaDevices web
  fallback and the `node-audiodevice` desktop path are both already implemented
  and will not be altered here.
- No real-time audio routing engine. `openHardwareInput` opens a `MediaStream`
  (web) or records the active device (desktop) but does not yet feed audio into
  the DAW transport graph — that is tracked separately under
  `web-player-studio-audio`.
- No backend (Express) involvement. Routes persist in the Electron user-data
  directory, not in Supabase or SQLite.
