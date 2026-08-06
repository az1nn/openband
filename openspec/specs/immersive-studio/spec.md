# Immersive Studio

## Overview
OpenBand renders themed studio rooms as real-time Three.js scenes on web. A hub screen (`virtual-studio.tsx`) places "furniture" that routes to each built-in tool, and immersive tool screens (`spatial-audio.tsx`, `acoustics.tsx`) provide spatial monitoring and room-acoustics visualization. `src/lib/loadThree.ts` provides a shared, memoized CDN loader for the `three` module, `src/lib/sceneLighting.ts` provides reusable point-light/gradient light rigs, and `src/lib/habboAssets.ts` (not yet wired into a screen) defines isometric room/asset palettes for furniture themes.

WebGL scenes are rendered inside a DOM `<div>` (`containerRef.current`) via `THREE.WebGLRenderer`. On non-web platforms the `Screen3DFallback` component is shown instead of the live scene. Three.js is not an npm bundle dependency — it is imported at runtime by URL (dynamic `import`), so all immersive screens share a single CDN list + memoized loader.

## Implementation Notes
- `app/virtual-studio.tsx` defines a `FURNITURE` array (`app/virtual-studio.tsx:25`) of `FurnitureDef` entries (id, name, icon, 3D position x/y/z, dimensions, `color`, `route`) — one piece per tool (mixing console, mastering, beatmaker, synth lab, DJ stage, auto-tune, live room, spatial audio, stem collider, tape lab, acoustics, cover jam), each routing to its own `app/<tool>.tsx` screen via `useRouter`. It builds a room shell (floor grid, walls, camera+orbit controls via Three.js), selects furniture by raycast on click. Uses `addSceneBulb` + `addRGBStrip` from `sceneLighting.ts` and `LightControls` for light color/intensity.
- `app/spatial-audio.tsx` builds a camera setup (`CAM_POS`, `TARGET`), a `createSpeaker` helper that builds a monitor group (pole, `BoxGeometry` box, emissive driver `CylinderGeometry` cone), and arranges them around the central listening position (X floor marker, chair). Uses `addSceneBulb`, `addRGBStrip`, `LightControls`.
- `app/acoustics.tsx` (`AcousticsLab`) builds a room shell (floor, back/left/right walls, ceiling via `PlaneGeometry`), a central listening-position X marker, a chair silhouette, and expanding `RingGeometry` "sound wave" rings animated outward from center. It exports a `treated` boolean state that toggles interactive acoustic-panel meshes on the walls (treated vs untreated modes).
- `src/lib/sceneLighting.ts` exports `addSceneBulb` (`sceneLighting.ts:1`) — a point light with wire/socket/bulb/halo mesh — and `addRGBStrip` (`sceneLighting.ts:64`) — a ground strip with emissive material plus small emissive dots. Both return the created meshes/materials for further manipulation.
- `src/lib/loadThree.ts` (`loadThree.ts:1`) exposes `loadThree(): Promise<Module>` plus `THREE_CDNS`. It memoizes the module, shares a single in-flight promise (`pending`), and cascades through unpkg → cdnjs → jsdelivr CDN URLs using `new Function("url", "return import(url)")` to bypass static bundler URL resolution, throwing if all CDNs fail.
- `src/lib/habboAssets.ts` defines an isometric room palette — `C` color constants for floor, walls, and each furniture theme (mixing console, mastering, timeline, piano roll, pedalboard, synth, waveform, etc.). It is **not yet implemented**: no screen imports it; it currently documents the intended theme/asset palette. See the Requirements marked NOT IMPLEMENTED.
- `src/components/LightControls.tsx` and `src/components/Screen3DFallback.tsx` (exported from `src/components` — see `Screen3DFallback` in `virtual-studio.tsx`) drive the interactive light and provide a graceful degraded view when Three.js cannot load or on non-web platforms.
- The `app/creativeModes.ts` mode registry (`src/lib/creativeModes.ts:19`, `:91`) links the "acoustics" and "spatial-audio" creative modes to their routes `/acoustics` and `/spatial-audio` respectively.

## Requirements
Three.js assets load at runtime via `loadThree()`; WebGL rendering is web-only in DOM. All interactive immersive screens degrade to `Screen3DFallback` outside the web platform or when `loadThree` fails.

### Requirement: Shared Three.js CDN loader
The system MUST load the `three` module once via `loadThree()` (`src/lib/loadThree.ts`), falling back across `THREE_CDNS`, and MUST reuse the same module instance for subsequent calls.

#### Scenario: Successful load
- **Given** a web browser with network access to at least one of the `THREE_CDNS`
- **When** `loadThree()` is called twice
- **Then** both calls return the same resolved `three` module object (single-flight, memoized `cached`)

#### Scenario: All CDNs fail
- **Given** network access that blocks all entries in `THREE_CDNS`
- **When** `loadThree()` is called
- **Then** the returned promise rejects with an `Error("Failed to load Three.js from all CDN sources")`

### Requirement: Scene lighting rigs
The system MUST provide reusable lighting rigs via `addSceneBulb` and `addRGBStrip` (`src/lib/sceneLighting.ts`) so every creative room shares a consistent look.

#### Scenario: Add a bulb
- **Given** a loaded `THREE` module and an empty `scene`
- **When** `addSceneBulb(THREE, scene)` is called
- **Then** a new `THREE.Group` is added to the scene
- **And** the group contains a `PointLight` (default color `0xfff1c1`) positioning at the bulb location

#### Scenario: Add an RGB ground strip
- **Given** a loaded `THREE` module and an empty `scene`
- **When** `addRGBStrip(THREE, scene)` is called
- **Then** a strip `Mesh` and a set of emissive dot `Mesh`es are added to the scene
- **And** the function returns `{ stripMat, dotMat }` for later reuse

### Requirement: Spatial monitoring arrangement (spatial-audio)
The system MUST render a spatial audio monitoring room in `app/spatial-audio.tsx`, with monitors arranged around a central listen position — via the `createSpeaker` helper that builds a pole + monitor `BoxGeometry` + emissive `CylinderGeometry` cone speaker per position.

#### Scenario: Spatial room renders
- **Given** a web browser and the resolved `three` module
- **When** the `spatial-audio` screen mounts
- **Then** a WebGL scene is built with multiple speaker/monitor groups and a light rig
- **And** the scene is appended to the screen's DOM `<div>` container

### Requirement: Acoustics room with treated/untreated mode (acoustics)
The system MUST render an acoustics lab room in `app/acoustics.tsx` with a room shell, central listening marker, chair, animated sound-wave rings, and interactive acoustic panels driven by a `treated` boolean state.

#### Scenario: Toggle treatment
- **Given** the `acoustics` screen rendered with `treated === false`
- **When** the user toggles `treated` to `true`
- **Then** acoustic-panel meshes are added/illuminated to represent an acoustically treated room
- **And** the scene reflects the new state without re-rendering the module

### Requirement: Furniture hub routing (virtual-studio)
The hub (`app/virtual-studio.tsx`) MUST route from each furniture piece (`FURNITURE[].route`) to the matching tool screen via `useRouter`.

#### Scenario: Enter a tool from the hub
- **Given** the hub rendered with the configured `FURNITURE` array
- **When** the user clicks the "Spatial Audio" furniture piece
- **Then** the app routes to `/spatial-audio` via `useRouter`

### Requirement: Isometric Habbo-style room assets [NOT IMPLEMENTED]
The system MUST expose, via `src/lib/habboAssets.ts`, a reusable isometric room/asset palette. `habboAssets.ts` currently defines only experimental color constants for furniture themes (mixing console, mastering, timeline, piano roll, pedalboard, synth, waveform, and more); no screen imports it.

#### Scenario: (not yet implemented)
- **Given** a request to use the isometric theme
- **When** `src/lib/habboAssets.ts` is imported by a screen
- **Then** the palette constants for furniture colors are available to build isometric room models
- **Status:** **Not yet implemented.** No screen imports `habboAssets` today. The model-building logic, screen wiring, and avatar system remain future work. This state is intentionally left unimplemented.

## Test Requirements (Vitest)
- [ ] `src/lib/loadThree.ts` cycle — `loadThree()` returns a module instance; a second call returns the same memoized object (mock `import`).
- [ ] All `THREE_CDNS` failing rejects with the documented CDN-failure error message.
- [ ] `src/lib/sceneLighting.ts`: `addSceneBulb(...)` adds a group containing a `PointLight` with default intensity `6`.
- [ ] `addRGBStrip` adds at least one strip mesh and returns `{ stripMat, dotMat }`.
- [ ] `app/spatial-audio.tsx` module renders without throwing given a stubbed `three` module (Vitest jsdom render).
- [ ] `app/acoustics.tsx` toggling `treated` changes the panel presence (jsdom render + state interaction).