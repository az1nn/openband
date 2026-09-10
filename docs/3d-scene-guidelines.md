# 3D Virtual Studio Guidelines

The Virtual Studio is a web-oriented visual navigation layer over the DAW. It does not own audio state or timing.

## Current architecture

- `app/virtual-studio.tsx` is the hub; tool rooms live under `app/`.
- `src/lib/loadThree.ts` lazy-loads Three.js `0.160.0` with CDN fallbacks.
- `src/lib/sceneLighting.ts` owns shared lighting/disposal helpers.
- `src/components/LightControls.tsx` exposes mutable light controls without React state in the render loop.
- `src/components/Screen3DFallback.tsx` is the non-web/CDN-failure fallback.
- Geometry is procedural; there is no production GLTF/HDRI asset pipeline today.

## Invariants

1. **Render reflects state; it never becomes the audio engine.** DAW/audio clocks and `requestAnimationFrame` stay independent.
2. **No audio computation in the render loop.** Consume already-derived values from shared state when visualization needs DAW data.
3. **Native I/O uses `@bridge` / `OpenBandNative`.** A scene must not call Electron, Tauri or Node filesystem APIs directly.
4. **Native platforms must have a fallback.** Do not assume WebGL/DOM APIs outside web.
5. **One owned render loop per scene.** Cancel it and remove listeners on unmount.
6. **Dispose GPU resources.** Geometry, materials/textures and renderer context must be released when a scene is destroyed.
7. **Guard async initialization.** A scene unmounted while Three.js is loading must not attach resources afterward.
8. **Keep frame work bounded.** Avoid React state churn, allocations and expensive domain computation inside the frame loop.
9. **No dead assets/dependencies.** Add models, post-processing or asset tooling only with a feature that uses and verifies them.

## Verification

Changes to 3D scenes should select evidence from:

- `tests/scenes.test.tsx` for render/fallback behavior;
- `tests/lib6.test.ts` for shared scene-lighting helpers;
- frontend typecheck and web build;
- manual browser/WebGL verification when visual behavior cannot be proven headlessly.

Performance or multi-user improvements belong in their own Issue/Spec Kit feature rather than a standing TODO list here.
