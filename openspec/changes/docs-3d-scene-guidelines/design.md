# Design: 3D Virtual Scene Guidelines

## Files & Edits

### 1. NEW `docs/3d-scene-guidelines.md` (canonical doc)

Sections (with strict status markers on every claim):

1. `# 3D Virtual Studio — Scene Guidelines & Knowledge Base`
   - scope note: read before touching any screen in `app/*.tsx` that hosts a
     Three.js scene.
2. `## Current State (ground truth)` — bullet map of every file + role:
   - `app/virtual-studio.tsx` (hub: `OrthographicCamera`, isometric room,
     `FURNITURE` array of 12 `FurnitureDef`, Raycaster click-to-open, local
     CapsuleGeometry ("You") avatar, `LightControls` ref-driven colors).
   - `app/tabs/virtual-studio.tsx` (tab shell → `<VirtualStudio/>`).
   - 12 sibling screens (perspective + custom spherical-drag orbit + wheel/pinch
     zoom, `ACESFilmicToneMapping`).
   - `src/lib/loadThree.ts` (memoized single-flight CDN loader, cascading
     unpkg → cdnjs → jsdelivr, `three@0.160.0`, `new Function` dynamic import).
   - `src/lib/sceneLighting.ts` (`addSceneBulb` pendant + `addRGBStrip` neon).
   - `src/lib/habboAssets.ts` — isometric 2D-canvas palette, **NOT wired**
     (matches `openspec/spec:immersive-studio` not-implemented marker).
   - `src/components/LightControls.tsx` (imperative ref → `{color,intensity}`).
   - `src/components/Screen3DFallback.tsx` (non-web/CDN-failure fallback).
   - `src/lib/presence.ts` / `backend/src/routes/presence.ts` — **SSE**, not
     WebSocket, DAW-only; no avatar sync in 3D.
3. **Render Loop & Decoupling** — principles:
   - audio/DAW state is never computed inside the rAF loop; the scene only
     renders values pushed via refs/setters (e.g. `lightRef`).
   - scene runs its own rAF on its own clock; audio runs on `audioSystem`.
   - No bridge between 3D scene and audio today → visually-live furniture is
     scripted ambient (avatar bob, emissive pulse, vinyl spin).
4. **Pipeline & quality today** — `renderer.setPixelRatio(min(dpr,2))`,
   `ACESFilmicToneMapping` (12 of 14 screens; hub intentionally
   NoToneMapping/toon), no composer, no SSAO/bloom, fog on a few screens,
   procedural-only geometry, no external assets. Lifecycle: on unmount cancel
   rAF, remove listeners, `container.removeChild`, `renderer.dispose()`.
5. **Target playbook (NOT implemented — aspirational alignment with the CS
   Brasil approach)** — each item tagged `[TODO]`:
   - extract managers (`SceneManager`/`CameraController`/`LightingSystem`);
   - post-processing: EffectComposer, half-res SSAO on depth only, focused
     UnrealBloomPass (threshold ≥0.85), final AgX tonemapping;
   - procedural IBL (PMREM/`RoomEnvironment`-style) instead of HDRI downloads;
   - offline asset pipeline (`gltf-transform` + `meshoptimizer`) **when/external
     glb/gltf assets are introduced** ;
   - rAF pausing on hidden tab/minimized; device-tier quality scaling
     (resolution, effects, shadows) via `useResponsive`;
   - true multi-user avatars (WebSocket or SSE position-sync) in 3D;
   - headless/Node invariant tests for scene connectivity & layout (reusing
     scenarios valid without WebGL).
6. **Priority suggestions** table — "what to improve next" ranked (e.g. rAF
   pause on hidden, device-quality tiers, avatar-sync, managers refactor,
   post-processing).
7. **Sources** — reference `openspec/specs/immersive-studio/spec.md`,
   `docs/unimplemented-specs.md`, selected archive changes.

### 2. `AGENTS.md` edits

- Add under `## Phase 2: Act` → *Design System Reference* table rows:
  `LightControls` | `defaultColor, defaultIntensity; forwardRef exposes {color,intensity}` | accent/backlight control for 3D scenes
  `Screen3DFallback` | `screenTitle?, ...` | Web-only & CDN-failure fallback for 3D screens.
- Add to "Project Architecture Quick Reference" `app/` tree:
  `virtual-studio.tsx   — 3D studio hub (three.js, isometric, avatar, click-to-open tools)`
  `tabs/virtual-studio.tsx — 3D Studio tab (renders app/virtual-studio.tsx)`
- Add a new section `### 3D & WebGL (Three.js Virtual Studio)` (placed before
  `### Audio System` or after `### Desktop Bridge`) listing:
  canonical doc pointer (`docs/3d-scene-guidelines.md`), `loadThree.ts`,
  `sceneLighting.ts`, `habboAssets.ts`, `LightControls`, `Screen3DFallback`,
  Web-only rule (native renders `Screen3DFallback`), SSE-not-WebSocket note,
  "render loop never touches audio logic" rule.
- Add pre-flight bullet: `Read docs/3d-scene-guidelines.md before touching any 3D screen.`

### 3. `docs/features-implementation.md`

Insert a `## ✅ Virtual Studio (3D Hub + 12 Screens)` status block (COMPLETE
scope: loaded via `loadThree`, hub + furniture routing + 12 tool rooms, RGB
light rigs, non-web fallback, happy-path tests) into the summary section. Keep
short; link to guideline doc + canonical spec.

### 4. `docs/reverted-features.md` §2

Mark `docs/3d-scene-guidelines.md` as **restored** (was reverted; recreated).

### 5. `docs/unimplemented-specs.md`

Amend §6 (Immersive studio avatar palette) to note guideline-doc pointer and
frame it as not-wired; keep as open item.

### 6. `openspec/specifications.md`

Add Three.js to the tech stack, cross-linking guideline doc.

## Notes

- All claims intentionally marked truth vs target. Do not invent features.
- No test files change (docs only); run nothing more than `npx tsc --noEmit` as
  a sanity smell gate (should pass unchanged).