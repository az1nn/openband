# 3D Virtual Studio — Scene Guidelines & Knowledge Base

> **Read this before touching any Three.js scene in this repo.** Web-only
> immersive environments: hub + 12 tool rooms. This doc is the single source of
> truth for the 3D layer: current state (truth), render-loop laws, quality levers
> that exist today, and an explicitly-marked improvement playbook.
>
> Canonical OpenSpec: `openspec/specs/immersive-studio/spec.md`.
> Unimplemented items: `docs/unimplemented-specs.md` §6.

---

## 1. What this is (and is not)

The 3D Virtual Studio is a **navigable presentation of the production space**, a
Habbo-style room used to *launch* DAW tool screens — it is **not** a game, and it
does **not** replace the DAW core. It never computes audio. Scene and audio run on
independent clocks.

Status markers used below:

- ✅ **implemented today** (verified in code)
- 🚫 **NOT implemented** — aspirational / planned. Do not assume it exists.

---

## 2. Current State (ground truth)

### 2.1 Code map

| File | Role |
| --- | --- |
| `app/tabs/virtual-studio.tsx` | Tab shell rendering `<VirtualStudio/>` (registered in `app/tabs/_layout.tsx` NAV_ITEMS as "3D Studio"). |
| `app/virtual-studio.tsx` | **Hub** screen: `OrthographicCamera` isometric room, `FURNITURE` array of 12 `FurnitureDef`, Raycaster click-to-open, local CapsuleGeometry ("You") avatar + WASD, `LightControls` ref-driven colors. No tone mapping (stylized toon look). |
| `app/beatmaker.tsx` … `app/acoustics.tsx` | **12 sibling tool rooms** (`beatmaker`, `dj-stage`, `vocal-booth`, `autotune`, `mixing-console`, `lofi-tape`, `cover-jam`, `synth-lab`, `stem-collider`, `live-room`, `spatial-audio`, `acoustics`). Perspective camera + custom spherical-drag orbit + wheel/pinch zoom, `ACESFilmicToneMapping`. |
| `src/lib/loadThree.ts` | ✅ Memoized, single-flight CDN loader (`loadThree()`), cascading unpkg → cdnjs → jsdelivr for `three@0.160.0`, via `new Function("url","return import(url)")`; throws if all CDNs fail. |
| `src/lib/sceneLighting.ts` | ✅ `addSceneBulb` (pendant PointLight + emissive bulb + halo) and `addRGBStrip` (emissive floor strip + dots). Returns mutable materials. |
| `src/lib/habboAssets.ts` | 🚫Experimental 2D-canvas isometric palette (colors, tile math, floor/wall/furniture draw). **NOT wired into any screen.** |
| `src/components/LightControls.tsx` | ✅ Forward-ref RGB preset + brightness control exposing `{ color, intensity }` to the rAF loop via a mutable ref (no React state in loop). |
| `src/components/Screen3DFallback.tsx` | ✅ Non-web / CDN-failure fallback screen ("As experiências 3D estão disponíveis apenas na versão web…"). |
| `src/lib/presence.ts` | ✅ SSE presence hook — **DAW project-editor only**, cursor/playhead; **not** WebSocket, **not** 3D avatar sync. |

### 2.2 Rendering pipeline today

- ✅ `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` on every screen.
- ✅ `ACESFilmicToneMapping` on **11 of 14** screens (all tool rooms except `beatmaker.tsx`; hub intentionally none for toon; `app/explorer.tsx` iframe separate).
- ✅ Procedural geometry only (`Box`, `Plane`, `Capsule`, `Sphere`, `GridHelper`, …). **Zero GLB/GLTF/HDRI/texture assets in the repo.**
- ✅ Fog (`scene.fog`) on **13 of 14** screens — all tool rooms + explorer; none on the hub.
- 🚫 **No post-processing**: no `EffectComposer`, no SSAO, no bloom, no AgX tonemapping, no resolution scaling pipeline.

### 2.3 Render loop & lifecycle

- ✅ One rAF loop per screen, delta-timed; avatar bob, per-furniture emissive pulse, `LightControls` color read via ref.
- ✅ Cleanup on unmount: `cancelAnimationFrame`, remove all listeners, `container.removeChild(renderer.domElement)`, then **traverse the scene disposing every `geometry`, every `material` and its texture-valued props, and finally call `renderer.forceContextLoss()`** via the shared `disposeScene(THREE, scene, renderer)` helper from `src/lib/sceneLighting.ts`.
- ✅ **Async-init cancellation:** the outer `useEffect` returns `() => { cancelled = true; cleanup?.(); }`; if the component unmounts during the async `loadThree()` call, the `.then` callback disposes the scene/renderer immediately when `cancelled` is already `true`.
- 🚫 No rAF pause on hidden tab / minimized / blur.
- 🚫 No device-tier quality scaling, no mesh LOD.

### 2.4 Audio / DAW decoupling (the key rule)

- ✅ **No audio/DAW state is ever computed inside the rAF loop.** Scene screens do
  not import `expo-audio`, `universalAudio`, `projectStore`, or `usePresence`.
- ✅ Scene and audio run on **independent clocks** — an FPS drop never stalls a
  sound timeline that lives in `clockManager`/the AudioContext.
- 🚫 No bridge currently pushes BPM, playhead, VU, or track state into the scene —
  "liveness" today is scripted ambient (avatar bob, emissive pulse, vinyl spin).

---

## 3. Rules for future 3D work (mandatory)

1. **Render is the reflection, never the engine.** The scene consumes values
   pushed from shared state; it **never** derives gain, EQ, automation, or sync.
2. **One clock per layer.** DAW timeline (clockManager worker / AudioContext) and
   the scene rAF are decoupled. Never block a `play()` on a frame.
3. **Keep audio out of `src/components` and 3D screens** — reuse
   `src/lib/universalAudio.ts`, expo-audio, `usePresence`/`useCollaboration`.
4. **Trigger the native layer only via `@bridge`** (`OpenBandNative`); a 3D scene
   must not know if it runs on Electron, Tauri, or a browser.
5. **Web-only.** Native (`Platform.OS !== "web"`) must render `Screen3DFallback`.
6. **No dead assets.** No HDRI downloads, no glTF blobs unless the task adds them.
7. **Check headless tests.** `tests/scenes.test.tsx` covers a subset; keep scene
   boot logic deterministic so it stays testable in Node without WebGL.

---

## 4. Target playbook — NOT implemented today (🚫 / TODO)

Aligned with the "optimize at origin + separate layers + concentrated loads"
perspective used in CS-style render work. Every line below is **aspirational**.

| # | Technique | Planned implementation | Why / impact |
| --- | --- | --- | --- |
| T1 | Extract scene managers | `SceneManager` / `CameraController` / `LightingSystem` modules instead of inline `useEffect` scenes | Testability, reuse across 13 screens, single teardown path |
| T2 | Procedural Image-Based Lighting (IBL) | `RoomEnvironment` / PMREM-generated gradients + a few lights instead of HDRI downloads | No big downloads, theme changes become code, smaller GPU/memory |
| T3 | Half-res SSAO on depth only | `SSAORenderPass` at ½ resolution reading the depth buffer only | Realistic contact shadows at a fraction of full-res cost |
| T4 | Focused bloom | `UnrealBloomPass`, threshold ≥ 0.85, narrow strength | Glow only on panels/indicators, no flat glare |
| T5 | Final AgX tonemapping | `AgXToneMapping` (r160) after compose | Balanced contrast, natural color, keeps DOM UI legible |
| T6 | Offline asset optimize | `gltf-transform` + `meshoptimizer` **before publishing any GLB** (dedup/meshopt/quantize) | Only needed once real model assets land |
| T7 | rAF pausing | Freeze loop on `visibilitychange=hidden` / minimized; resume on focus | CPU/GPU almost zero when not visible (mobile battery) |
| T8 | Device quality tiers | Resolution cascade via `useResponsive`; disable SSAO on phones, shadows on/off | Consistent smoothness on cheap devices |
| T9 | True multi-user avatars | Position-sync over SSE (or WebSocket) + spawn remote avatars in the hub | Real collaboration in the shared space |
| T10 | Headless invariants | Node tests validating layout/connectivity/furniture positions without a browser | Detect regressions early (same spirit as CS invariant) |

Suggested priority for "improve next": **T7 → T8 → T9 → T1 → T5** (cheap, safe,
high-visibility first), then post-processing **T2/T3/T4** when a compositor is
added.

---

## 5. Testing

- ✅ `tests/scenes.test.tsx` — renders live-room / lofi-tape / beatmaker / dj-stage:
  header, 3D container, "Loading…", "3D Unavailable", `LightControls` accent colors;
  also houses the 3D screen mocks + CDN-failure coverage.
- ✅ `tests/lib6.test.ts` — `sceneLighting` (`addSceneBulb` / `addRGBStrip`).
- 🚫 No headless 3D graph/layout tests (see T10).

---

## 6. Related documents

- `openspec/specs/immersive-studio/spec.md` — canonical spec (loader, lighting,
  spatial/acoustics, furniture routing, habboAssets **NOT IMPLEMENTED**).
- `docs/unimplemented-specs.md` §6 — immersive avatar palette (open item).
- `docs/reverted-features.md` §2 — history of this doc's revert/restore.
- `.qwen/skills/auto-skill-isometric-habbo-studio-threejs/SKILL.md` — agent skill.
- `README.md` — "Virtual Studio" feature blurb.