# Design — Startup Lazy Loading & Bundle Trimming

## 1. Loading model (how lazy loading is achieved)

Three complementary mechanisms, each verified independently:

### 1.1 Route-level code splitting on web (`asyncRoutes`)
Expo Router SDK 57 ships `asyncRoutes` (alpha): every route module is wrapped in a `Suspense` boundary and emitted as its own JS chunk on web. `app.json` switches the `expo-router` plugin from a bare string to a config array:

```json
"plugins": [
  "expo-audio",
  "expo-asset",
  ["expo-router", { "asyncRoutes": { "web": true, "default": "development" } }],
  "expo-secure-store",
  "expo-status-bar"
]
```

- `web: true` → per-route chunk splitting in web production **and** development.
- `default: "development"` → native dev builds lazy-bundle routes too (faster dev startup); native production automatically disables splitting ("production is currently web-only and will be disabled on native"), so native keeps a single sync bundle with no Suspense regressions.
- `web.output: "single"` stays; async routes still emit one `index.html` plus hashed route chunks loaded on navigation.
- Effect: the 12 tool rooms + `virtual-studio` hub + `studio/[id]` + `mastering` + `extractor` move out of the entry chunk. Navigating to a room fetches only that room's chunk, then `loadThree()` (already deferred) fetches `three` from CDN.

**Gate/rollback:** this is the last step. If `expo export` or the e2e smoke fails, revert the plugin entry — the bundle-shape wins (§1.2–§1.4) stand alone.

### 1.2 Direct imports instead of the barrel (module-graph trimming)
The barrel `src/components/index.ts` re-exports 81 symbols; Metro statically follows every `export { X } from "./X"`, so importing any name from it pulls and eagerly requires **all** component modules. On native (Hermes/Metro lazy `require`) and in the entry chunk on web this means studio-only modules (`Synth`, `PianoRoll`, `MasteringSuite`, `Patchbay`, `BranchManager`, `CommandPalette`, …) are required at startup.

Fix: each eager route imports only the exact files it uses, following the existing pattern in `app/tabs/_layout.tsx:7-9` (`MiniPlayer`, `Sidebar`, `ErrorBoundary`). The mapping rule is 1:1 with the barrel's `export { X } from "./Y"` lines (read `src/components/index.ts` to derive each path; e.g. `useToast` → `src/components/Toast.tsx`, `setMiniPlayerState` → `src/components/MiniPlayer.tsx`, `LightControls` → `src/components/LightControls.tsx`).

Files to convert (barrel → direct):

| File | Barrel imports to convert |
|---|---|
| `app/tabs/index.tsx:16-28` | `PageHeader, Button, QuickActions, setMiniPlayerState, QuickTools, NewProject, OnboardingFlow, FeedPostCard, Loading, FeedSkeletonCard, useToast` |
| `app/(auth)/login.tsx:12` | `Button, TextInput` |
| `app/extractor.tsx:15` | `PageHeader, Card, Button, Badge, ProgressBar, NewProject, Sidebar, MobileDrawer` |
| `app/settings-ai.tsx:11` | `PageHeader, Button, Badge, TextInput, Divider, Card` |
| `app/tabs/moments.tsx:4` | `PageHeader, NewProject, SamplePackCard, MomentCard, Loading, EmptyState` |
| `app/tabs/library.tsx:4` | `EmptyState, PageHeader, Button, NewProject, ProjectCard, Loading` |
| `app/tabs/account.tsx:13` | `PageHeader, Avatar, Button, TextInput, Divider, Badge, Loading` |
| `app/tabs/settings.tsx:5` | `PageHeader, Avatar, Divider, Badge, Button, CardRow` |
| `app/tabs/modes.tsx:4` | `PageHeader, Card, CardIcon, Divider` |
| `app/mastering/index.tsx:4` | `MasteringSuite, Sidebar, MobileDrawer, EmptyState, Button` |
| `app/studio/[id].tsx:44` | multi-name (read file; convert to direct) |
| `app/studio/StudioModals.tsx:21` | multi-name (read file; convert to direct) |
| 14 web 3D files (`app/virtual-studio.tsx`, 12 rooms, `app/explorer.tsx`) | `Screen3DFallback` (and `Screen3DHeader` in `explorer.tsx`) → `../../src/components/Screen3DFallback` |

Do **not** delete or change `src/components/index.ts` — it remains for tests/stories.

### 1.3 Remove dead `AudioEngineProvider`
`useAudioEngine()` has zero consumers in `app/` or `src/` (grep-verified). The provider's only effect is pulling `src/lib/midiSynth` (1318 lines) → `soundfont-player` + `lamejs` + `pluginChain` into the startup graph.

- `app/_layout.tsx`: delete line 12 import and lines 115/119 wrapper.
- Delete `src/context/AudioEngine.tsx`.
- `tests/layout.test.tsx:52-53`: remove the `vi.mock("../src/context/AudioEngine", …)` block (and any assertion on `data-testid="audio-engine-provider"`).
- Keep `disposeAllAudio()` from `src/lib/universalAudio` (already the real teardown at `app/_layout.tsx:92,97`).

**Pre-delete gate:** re-grep `useAudioEngine|AudioEngineProvider` across `app/`, `src/`, and `tests/`; abort if any real consumer exists.

### 1.4 Defer heavy modules behind dynamic `import()`
Both are used only at call time (verified: not at module scope), so they can be loaded lazily.

- **`src/lib/audio.ts`** — `Mp3Encoder` from `lamejs` is used only inside `audioBufferToMp3BlobAsync` (line 119). Replace the static import (line 1) with `const { Mp3Encoder } = await import("lamejs");` inside that async function. `audioBufferToWavBlob` and `generateWaveform` (used by the feed for previews) no longer force `lamejs` into the graph.
- **`src/lib/universalAudio.ts`** — `applyPluginChain` (from `../lib/pluginChain`) is used only at line 355 (inside an async mixdown path). Replace the static import (line 4) with `const { applyPluginChain } = await import("../lib/pluginChain");` at the call site. `pluginChain` → `mastering`/`timeStretch`/`voiceCleaner`/`modulationMatrix` then only evaluate when the app actually renders a mixdown/export. `resolveAssetUrl` (assetStore) stays static (light module; `@bridge` already in the eager graph via `projectStore`).

## 2. What this does NOT change

- No component props/API changes — imports resolve to the same modules.
- No `three` bundling change — it stays a runtime CDN dependency (`src/lib/loadThree.ts`).
- No `web.output` change (stays `"single"`).
- No visual/UI change, no new deps, no config files other than `app.json`'s expo-router plugin entry.

## 3. Verification & measurement (how we assert lazy loading)

### 3.1 Bundle shape (web)
```
# baseline (before edits)
npx expo export --platform web --clear
ls dist/_expo/static/js/web/        # expect a single entry-*.js

# after edits (M2)
npx expo export --platform web --clear
ls dist/_expo/static/js/web/        # expect entry-*.js + N route chunks
```
Assert entry-chunk contents:
```
grep -L "soundfont-player" entry-*.js   # not present in entry
grep -L "lamejs" entry-*.js
grep -L "midiSynth" entry-*.js
grep -L "beatmaker\|synth-lab\|mixing-console" entry-*.js
```
Record raw + gzip sizes of the entry chunk before/after (target ≥ 40% entry reduction, matching vercel-performance P2's gate).

### 3.2 Native startup
The single native bundle still contains everything, but modules reachable only via direct imports/dynamic `import()` are not evaluated at launch. This is asserted indirectly: no `React.lazy`/bundle metrics needed — the module graph is verifiable by reading the import statements (M1) and by `npx tsc --noEmit` + vitest still passing.

### 3.3 Manual smoke (web)
- `/` or `/tabs` loads: feed renders; network tab shows entry chunk (+ feed chunks only, no 3D/studio chunks).
- Navigate: Feed → Library → Virtual Studio hub (hub chunk + CDN `three` load) → click a furniture → tool-room chunk loads and scene renders.
- Same smoke on native dev build (single bundle, fallback screens intact).

## 4. Risks & mitigations

| Risk | Mitigation |
|---|---|
| `asyncRoutes` is alpha; export or smoke could break | Gated last; revert the `app.json` plugin entry to the string `"expo-router"` and keep M1 wins |
| Native dev lazy bundling could interact with Fast Refresh | If flaky, set `asyncRoutes: { web: true, android: false, ios: false, default: "development" }` |
| `import("lamejs")` / `import("pluginChain")` typing | Same module resolution as today's static imports; `tsc` catches drift |
| Deleted `AudioEngineProvider` later needed by studio | Re-introduce a lazy version scoped to the studio route; current usage is zero |
| Route chunk naming changes between exports | All chunk checks use glob `entry-*.js`; vercel-performance §2.4 post-export reads the entry hash deterministically |

## 5. Files touched

- `app.json` (plugin entry)
- `app/_layout.tsx`, `src/context/AudioEngine.tsx` (delete)
- `app/tabs/index.tsx`, `(auth)/login.tsx`, `extractor.tsx`, `settings-ai.tsx`, `tabs/{moments,library,account,settings,modes}.tsx`, `mastering/index.tsx`, `studio/[id].tsx`, `studio/StudioModals.tsx`, 14 web 3D files
- `src/lib/audio.ts`, `src/lib/universalAudio.ts`
- `tests/layout.test.tsx`
- `docs/features-implementation.md`, `openspec/specs/startup-lazy-loading/spec.md` (new), `openspec/changes/vercel-performance/tasks.md` (note task 6 subsumed)
