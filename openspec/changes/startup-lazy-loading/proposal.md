# Proposal — Startup Lazy Loading & Bundle Trimming

> Status: Draft — awaiting approval. Related open work: `openspec/changes/vercel-performance` P2 (code splitting, gated, never landed). This change **subsumes** vercel-performance P2 task 6 (code splitting).

## Context

The app feels slow on **web and mobile, including the simple home/feed page**. A full audit (entry point, tab layout, home route, Three.js scenes, and the module graph) found that the app **does not lazy-load anything**: there is zero `React.lazy`, zero `Suspense`, and the only dynamic `import()` in production is the Three.js CDN loader (`src/lib/loadThree.ts`). `app.json:32` sets `"web": { "output": "single" }`, so every route ships in one monolithic bundle.

Measured causes:

| # | Bottleneck | Evidence |
|---|---|---|
| 1 | **Home page imports the 77-symbol barrel** `src/components` | `app/tabs/index.tsx:16-28` pulls the full barrel, so `wasmPluginHost`, `hardwareIO`, `subtractiveSynth`, `midiSynth`→`soundfont-player`, `mastering`, `lufs`, `videoExport`, `projectBranching`, `cloudSync`, `zustand`, `lamejs` are reachable from the feed's module graph even though the feed renders only 11 of them |
| 2 | **Dead `AudioEngineProvider` mounted at root** | `app/_layout.tsx:12,115-119` mounts `AudioEngineProvider`, which statically imports `src/lib/midiSynth` (1318 lines) → `soundfont-player` + `lamejs` + `pluginChain` (mastering/timeStretch/voiceCleaner). `useAudioEngine()` has **zero consumers** in `app/` or `src/` — the provider is dead weight on every startup |
| 3 | **Home directly imports heavy audio libs at module scope** | `app/tabs/index.tsx:31` `constants` → `src/lib/audio.ts` → `lamejs`; `:38` `universalAudio` → `applyPluginChain` (full DSP). All three libs are only needed at call time (MP3 export, mixdown) |
| 4 | **~5,779 lines of Three.js scene code ship in the initial bundle** | The hub + 12 tool rooms are file-based routes but, under `output: "single"` + no `asyncRoutes`, all evaluate at startup. `three` itself is already deferred (runtime CDN via `loadThree`) — this part is correct |
| 5 | **Barrel imports remain in 12 eager routes** | P0 of `vercel-performance` narrowed the barrel only in the two root layouts. `tabs/index.tsx`, `(auth)/login.tsx`, `extractor.tsx`, `settings-ai.tsx`, `tabs/moments|library|account|settings|modes.tsx`, `mastering/index.tsx`, `studio/[id].tsx`, `studio/StudioModals.tsx` still import the barrel |

## Objectives

1. **Assert and implement module-level lazy loading** so the app no longer evaluates everything at startup.
2. **Per-route code splitting on web** via expo-router `asyncRoutes` (SDK 57 supports it): the 12 tool rooms, `virtual-studio`, `studio/[id]`, `mastering`, `extractor` become on-demand chunks.
3. **Trim the eager module graph**: de-barrel all eager routes; remove the dead `AudioEngineProvider`; defer `lamejs` and `pluginChain` behind dynamic `import()`.
4. **Keep native startup fast too** — native production cannot split bundles, but lazy module evaluation (direct imports, dynamic `import()`, dead-code removal) still cuts startup evaluation cost.
5. **No new dependencies. No visual or behavioral change.**

## Acceptance criteria

- [ ] `npx expo export --platform web --clear` produces an **entry chunk + multiple route chunks** (not a single JS file).
- [ ] The entry chunk **does not contain** `soundfont-player`, `lamejs`, `midiSynth`, or the 3D tool-room route code (verified by grep of `dist/_expo/static/js/web/`).
- [ ] Home/feed renders and is interactive without fetching 3D/studio chunks (verified in browser network tab).
- [ ] Navigating the hub raycast → a tool room still renders the 3D scene (route chunk loads on demand).
- [ ] `npx tsc --noEmit`, `npx vitest run`, `npm run test:legacy`, `cd backend && npx tsc --noEmit`, and `npm run build` all pass.
- [ ] `useAudioEngine` confirmed unused before deleting; zero consumers remain after.

## Scope

**M** — one `app.json` plugin-config change; import rewrites across ~12 route files + 14 web 3D files; removal of `src/context/AudioEngine.tsx` + its test mock; two dynamic-import edits in `src/lib/audio.ts` and `src/lib/universalAudio.ts`; `docs/features-implementation.md` update. No new dependencies. Reversible (config gate is last).

## Out of Scope

- **3D runtime rendering performance** (rAF pause on tab-hidden, `EffectComposer`/SSAO/Bloom/AgX, shared scene hooks, gltf asset optimization) — a separate future phase; see `docs/3d-scene-guidelines.md` T1–T10.
- **Service-worker precache, icon compression, dead deps removal** (`@react-three/fiber`, `@react-three/drei`, `three`) — owned by `vercel-performance` P2.
- Switching `web.output` to `"static"`.
- Rewriting the audio engine architecture.
