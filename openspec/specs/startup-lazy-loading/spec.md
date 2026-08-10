# OpenSpec: Startup Lazy Loading & Bundle Trimming Specification

This document is the Source of Truth for how OpenBand defers non-critical modules so the app starts faster on **web and native**. It records the shipped M1 + M2 behavior: module-graph trimming (direct imports, dynamic `import()`, dead-code removal) plus route-level code splitting on web via expo-router `asyncRoutes`. It subsumes `openspec/specs/vercel-performance/spec.md` P2 task 6 (code splitting).

---

## 1. Overview & Model

Lazy loading is achieved with three complementary, independently-verifiable mechanisms:

1. **Route-level code splitting on web (`asyncRoutes`)** — every route module becomes its own hashed JS chunk, loaded on navigation.
2. **Direct imports instead of the barrel (`src/components/index.ts`)** — eager routes import only the exact component files they render; the barrel re-exports ~80 symbols and Metro statically requires every `export { X } from "./X"`, pulling studio/DSP-only modules into the startup graph.
3. **Dynamic `import()` for heavy call-time modules** — `lamejs`, `pluginChain`, and `soundfont-player` load only when first used (MP3 export, mixdown, soundfont preload), never at startup.
4. **Dead-code removal** — `AudioEngineProvider` (`src/context/AudioEngine.tsx`) had zero consumers and statically imported `midiSynth` (1318 lines) → `soundfont-player` + `lamejs` + `pluginChain`; it was deleted.

The design carries zero visual/behavioral change and adds no dependencies.

---

## 2. `app.json` config (`asyncRoutes`)

The `expo-router` plugin entry is a config array (SDK 57):

```json
[
  "expo-router",
  { "asyncRoutes": { "web": true, "default": "development" } }
]
```

- `web: true` → per-route chunk splitting in web production and development.
- `default: "development"` → native dev lazy-bundles routes too (faster dev startup); native **production** keeps a single sync bundle (no Suspense regressions on Android/iOS).
- `web.output: "single"` is unchanged — asyncRoutes still emits one `index.html` plus hashed route chunks.

---

## 3. What was shipped (by module)

### 3.1 Removed dead `AudioEngineProvider`

- `app/_layout.tsx`: removed the `AudioEngineProvider` import and wrapper (lines 12, 115–119).
- Deleted `src/context/AudioEngine.tsx`.
- `tests/layout.test.tsx`: removed the `vi.mock("../src/context/AudioEngine", …)` block and its testid assertion.
- **Verification:** `rg 'AudioEngineProvider|useAudioEngine' app/ src/ tests/` → zero matches.

### 3.2 De-barrelled eager routes (direct imports)

Every eager route now imports only its used components, derived 1:1 from the barrel's `export { X } from "./Y"` lines. `src/components/index.ts` is unchanged (tests/stories still use it).

Converted: `app/tabs/index.tsx`, `app/(auth)/login.tsx`, `app/extractor.tsx`, `app/settings-ai.tsx`, `app/tabs/{moments,library,account,settings,modes}.tsx`, `app/mastering/index.tsx`, and all 14 web 3D screens (`virtual-studio`, the 12 tool rooms, `explorer.tsx`) import `Screen3DFallback`/`Screen3DHeader` directly.

> **Barrel retained by design:** the studio route (`app/studio/[id].tsx`, `app/studio/StudioModals.tsx`) intentionally keeps the `src/components` barrel import. Those files live in a lazy route chunk, not the entry bundle, so they do not affect startup and de-barrelling them was deliberately skipped.

- **Verification:** `rg 'from "(\.\./)+src/components"' app/` → the only remaining refs are the two studio files, intentionally retained in lazy chunks (`app/studio/[id].tsx:44`, `app/studio/StudioModals.tsx:21`).

### 3.3 Deferred heavy modules

| Module | Location | Change |
|---|---|---|
| `lamejs` (`Mp3Encoder`) | `src/lib/audio.ts` | `await import("lamejs")` inside `audioBufferToMp3BlobAsync` |
| `pluginChain` (`applyPluginChain`) | `src/lib/universalAudio.ts` | `await import("../lib/pluginChain")` at the mixdown call site |
| `soundfont-player` | `src/lib/midiSynth.ts` | static import → type-only + `await import("soundfont-player")` in `preloadSoundfont` |

---

## 4. Measured bundle shape (web export)

Baseline (pre-change): one monolithic `entry-*.js` shipping the full route set. After this change `npx expo export --platform web --clear` emits an entry chunk **plus** per-route chunks:

| Artifact | Raw bytes | Gzip bytes |
|---|---|---|
| `entry-*.js` | 1,114,239 (~1.06 MiB) | 294,630 (~288 KiB) |
| `__common-*.js` (shared lazy chunk) | 1,135,030 | — |
| route chunks (34 web bundles total) | per-screen 8–168 KB | — |

Route examples: `beatmaker` ~8 KB, `synth-lab` ~9 KB, `mixing-console` ~14 KB, `studio/[id]` 76 KB, `tabs/index` 168 KB (each its own hash-named chunk).

### Entry-chunk assertions (verified)

`grep -L` against `dist/_expo/static/js/web/entry-*.js`:

- `soundfont-player` → **ABSENT** ✅
- `lamejs` → **ABSENT** ✅
- `midiSynth` / `renderTracksToUrl` → **ABSENT** ✅
- `beatmaker` / `synth-lab` / `mixing-console` → present only as Metro lazy-split route getters + chunk URLs (route string names, zero room code) ✅

`__common` and all route chunks are fetched on demand as the user navigates; the feed/tabs load only entry + feed chunk.

---

## 5. Native behavior

Native production cannot split bundles, but the module-graph trimming still cuts startup evaluation cost because `lamejs`, `pluginChain`, `soundfont-player`, and `midiSynth`'s heavy import graph are no longer eagerly required by the entry module. Verified indirectly via `npx tsc --noEmit`, the vitest suite, and manual dev-build smoke (fallback screens intact). Native dev additionally lazy-bundles routes (`default: "development"`).

---

## 6. Rollback / gates

- M1 wins (de-barrel, dead-code removal, dynamic imports) stand alone and are fully reversible.
- `asyncRoutes` is the gated last step. **If export or smoke breaks:** revert the `app.json` plugin entry to the string `"expo-router"` and re-run the full gate (`npm run build`, vitest, tsc). M1 remains shipped.

---

## 7. Test Requirements

- [x] `npx tsc --noEmit` — zero errors
- [x] `cd backend && npx tsc --noEmit` — zero errors
- [x] `npx vitest run` — 1456 tests, all pass
- [x] `npm run test:legacy` — 24 tests, all pass
- [x] `npm run build` — export + post-export succeed
- [x] `npx expo export --platform web --clear` — entry chunk + route chunks emitted
- [x] entry chunk free of `soundfont-player`, `lamejs`, `midiSynth`
- [x] `rg 'AudioEngineProvider|useAudioEngine'` — zero matches
- [x] `rg 'from "(\.\./)+src/components"' app/` — only the two intentional studio-file refs remain (`app/studio/[id].tsx:44`, `app/studio/StudioModals.tsx:21`, lazy chunks not in entry)