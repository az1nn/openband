# Design: mount-patchbay Hardware I/O Routing Matrix

## Architectural Overview

```
┌──────────────────┐     ┌────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Patchbay.tsx    │◀──▶ │  hardwareIO.ts     │◀──▶ │  OpenBandNative     │◀──▶ │ electron/main.js │
│  (RN/React UI)   │     │  (bridge adapter)  │     │  (bridge/index)      │     │  (IPC handlers)  │
│  trackIds,       │     │  patchState cache  │     │  auto-detects:      │     │  patch-routes.json│
│  drag channels,  │     │  hydrate-from-native│     │  electron | tauri |  │     │  node-audiodevice│
│  drop on track   │     │                     │     │  browser fallback   │     │                  │
└──────────────────┘     └────────────────────┘     └─────────────────────┘     └──────────────────┘
```

The feature is **web-only rendering** of a matrix; the persistence and device
enumeration live in the Electron main process via the swappable desktop bridge.

## Data Flow

### 1. Device enumeration (inputs list)

- `Patchbay.tsx` mounts (`visible` flips true) → `useEffect` calls
  `enumerateAudioDevices()` (hardwareIO.ts:74).
- **Desktop (`Platform.OS !== "web"`)** path: if `nativeSupports("enumerateAudioDevices")`
  → `OpenBandNative.enumerateAudioDevices()` → `electron.invoke("enumerate-audio-devices")`
  → `main.js` `loadNativeAudioDevices()` → `require("node-audiodevice").enumerate()`
  → `{ inputs, outputs }`. Each input is a `BridgeAudioDevice` cast to `AudioDevice`.
  On failure/empty the IPC returns `{ inputs: [], outputs: [] }`.
- **Web** path: prompts for mic permission, calls
  `navigator.mediaDevices.enumerateDevices()`, maps each `audioinput`/
  `audiooutput` `MediaDeviceInfo` into `AudioDevice` (defaulting sampleRates to
  `[44100, 48000, 96000]`, channelCounts to `[2]`).
- Result: `setInputs(ins)`. The local `patchState.inputDevices` is also written.

### 2. Channel expansion

- User clicks an input device label → `selectDevice(deviceId)` →
  `getHardwareChannels(deviceId, 16)` (hardwareIO.ts:145).
- Channels are derived from `patchState.inputDevices` (not re-queried):
  `{ deviceId, channelIndex, label: "${device.label} Ch ${i+1}", sampleRate }`.
- UI renders each channel as a draggable row.

### 3. Route creation (drag → drop)

- Drag starts on a channel → `setDragSource(channel)`.
- Drop on a track label → `handleDrop(trackId)` → `createPatchRoute(dragSource, trackId)`
  (hardwareIO.ts:211).
- A `PatchRoute` is built with id `route-${Date.now()}-${random4}`:
  `{ id, source, targetTrackId, targetChannel, gain, enabled }`.
- Local `patchState.routes` is immutably appended.
- If desktop: `OpenBandNative.createPatchRoute(toBridgeRoute(route))`
  → `electron.invoke("create-patch-route", route)` → `main.js`
  reads `patch-routes.json`, pushes, writes back. Errors are swallowed
  (`.catch(() => {})`).
- `refresh()` re-reads `getPatchbayState()` and `setRoutes(...)`.

### 4. Route hydration (lazy one-shot)

- `getPatchbayState()` (hardwareIO.ts:265): if desktop and `!routesHydrated`,
  sets `routesHydrated = true` and fires `OpenBandNative.getPatchRoutes()`
  → `main.js` reads `patch-routes.json` → sets `patchState.routes`.
- Returns a **deep clone** (`JSON.parse(JSON.stringify(patchState))`) to break
  reference sharing with component state (avoids in-place mutation bugs).

### 5. Route removal

- Route chip pressed → `handleRemoveRoute(routeId)` → `removePatchRoute(routeId)`
  (hardwareIO.ts:235) → filters `patchState.routes` locally and, on desktop,
  `OpenBandNative.removePatchRoute(routeId)` → `main.js` filters by id and
  rewrites `patch-routes.json`.

## State Shape

`PatchbayState` (hardwareIO.ts:31), held as module-private singleton
`patchState` (hardwareIO.ts:39):

```ts
interface PatchbayState {
  routes: PatchRoute[];
  inputDevices: AudioDevice[];
  outputDevices: AudioDevice[];
  sampleRate: number;   // default 44100
  bufferSize: number;   // default 256
}
```

- `routesHydrated: boolean` — guards the one-shot native read.
- `mediaStream` / `previewCtx` — web `getUserMedia` handles (unrelated to routes).

## Bridge Contract

`src/bridge/interface.ts` (lines 20-71) — `NativeBridge`:

| Method | Signature | Returns |
|---|---|---|
| `enumerateAudioDevices` | `() => Promise<{inputs: BridgeAudioDevice[]; outputs: BridgeAudioDevice[]}>` | device lists |
| `openHardwareInput` | `(deviceId, channelCount?, sampleRate?) => Promise<boolean>` | open result |
| `closeHardwareInput` | `() => Promise<void>` | — |
| `createPatchRoute` | `(route: BridgePatchRoute) => Promise<void>` | — |
| `removePatchRoute` | `(routeId: string) => Promise<void>` | — |
| `getPatchRoutes` | `() => Promise<BridgePatchRoute[]>` | persisted routes |

`BridgePatchRoute` (interface.ts:37) mirrors `PatchRoute` exactly:
`{ id, source: BridgeHardwareChannel, targetTrackId, targetChannel, gain, enabled }`.

`electron.ts` delegates via `requireAPI().<method>`; `browser.ts` provides
no-op fallbacks (`createPatchRoute` / `removePatchRoute` resolve to void,
`getPatchRoutes` resolves `[]`); `tauri.ts` warns and returns null.

## Electron IPC Handlers

`electron/main.js` (lines 296-348), `app.getPath("userData")/patch-routes.json`:

- `enumerate-audio-devices` → `loadNativeAudioDevices()` (try `node-audiodevice.enumerate()`, catch → `[]`).
- `open-hardware-input(deviceId, channelCount, sampleRate)` → stores in
  `activeHardwareInput` sentinel (not yet wired to an audio graph).
- `close-hardware-input` → clears sentinel.
- `create-patch-route(route)` → `readPatchRoutes().push(route); writePatchRoutes()`.
- `remove-patch-route(routeId)` → `filter(r => r.id !== routeId); write()`.
- `get-patch-routes` → `readPatchRoutes()`.

Persistence is a flat JSON array with **no schema version** and **no atomic
write** (direct `fs.writeFileSync`).

## UI Wiring

- Entry: tool palette button `studio.toolPatchbay` (label "🔌  Patchbay") in
  `app/studio/[id].tsx:1638` → `openModal("patchbay")`.
- Modal host: `app/studio/StudioModals.tsx:282` —
  `<Patchbay visible={showPatchbay} onClose={closeModal("patchbay")}
  trackIds={trackIds} onRouteCreated={() => {}} onRouteRemoved={() => {}} />`.
- Props contract: `visible`, `onClose`, `trackIds: string[]`, optional
  `onRouteCreated`/`onRouteRemoved` callbacks.

## Gaps & Residual Work

### G1. Duplicate route prevention (open)

`createPatchRoute` (hardwareIO.ts:211) does **not** check for an existing route
with the same `source` (deviceId+channelIndex) + `targetTrackId` +
`targetChannel`. A user can create multiple identical routes; the local array
and `patch-routes.json` accumulate duplicates. Fix: pre-filter
`patchState.routes` for an identical source/target before appending; surface a
dedup flag on the native write side.

### G2. Dangling target cleanup (open)

Routes reference `targetTrackId` by id. If a track is deleted from the studio
(no route cascade), the stored route becomes dangling. Neither
`hardwareIO.ts` nor `main.js` garbage-collects orphaned targets. Fix: on
`getPatchRoutes` hydration, drop routes whose `targetTrackId` is no longer in
the active `trackIds` set (the UI already owns `trackIds`).

### G3. No-op error handling

Both `enumerateAudioDevices` (desktop catch) and the route CRUD
`.catch(() => {})` swallows errors silently. Acceptable for a stub but
G2/G1 fixes should reintroduce at least warn-level logging.

## Non-Regression Constraints

- The bridge auto-detect layer (`src/bridge/index.ts`) must keep all six methods
  present — removing any breaks the web fallback parity.
- `getPatchbayState()` must continue returning a deep clone (G2 fix depends on
  post-filter rehydration).
- `patch-routes.json` schema must remain a flat `BridgePatchRoute[]` to avoid
  breaking persisted desktop sessions.
