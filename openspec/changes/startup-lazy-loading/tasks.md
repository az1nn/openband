# Tasks — Startup Lazy Loading & Bundle Trimming

> Status: Draft — awaiting approval. Subsumes `vercel-performance` P2 task 6 (code splitting). Order matters: M1 (safe, no config) lands first; M2 (asyncRoutes) is gated last.

## M0 — Baseline measurement

- [ ] Record current web bundle: `npx expo export --platform web --clear`; list `dist/_expo/static/js/web/` (expect a single `entry-*.js`); record raw + gzip size of the entry chunk. Save in `openspec/specs/startup-lazy-loading/spec.md` §Baseline.

## M1 — Bundle-shape wins (safe, reversible, no config change)

### 1. Remove dead `AudioEngineProvider`
- [ ] Grep `useAudioEngine|AudioEngineProvider` across `app/`, `src/`, `tests/`. **Abort if any real consumer exists.** (Expected: only `app/_layout.tsx` + `tests/layout.test.tsx` mock.)
- [ ] `app/_layout.tsx`: remove import (line 12) and the `<AudioEngineProvider>` wrapper (lines 115, 119).
- [ ] Delete `src/context/AudioEngine.tsx`.
- [ ] `tests/layout.test.tsx`: remove the `vi.mock("../src/context/AudioEngine", …)` block (lines 52-53) and any `data-testid="audio-engine-provider"` assertion.
- [ ] Verify: `npx tsc --noEmit` clean; `npx vitest run tests/layout.test.tsx` passes.

### 2. De-barrel eager routes
For each file, replace the `src/components` barrel import with direct per-file imports derived from `src/components/index.ts`'s `export { X } from "./Y"` lines. Do not change `src/components/index.ts`.

- [ ] `app/tabs/index.tsx:16-28` — 11 names → direct (PageHeader, Button, QuickActions, setMiniPlayerState→MiniPlayer, QuickTools, NewProject, OnboardingFlow, FeedPostCard, Loading, FeedSkeletonCard, useToast→Toast).
- [ ] `app/(auth)/login.tsx:12` — Button, TextInput.
- [ ] `app/extractor.tsx:15` — PageHeader, Card, Button, Badge, ProgressBar, NewProject, Sidebar, MobileDrawer.
- [ ] `app/settings-ai.tsx:11` — PageHeader, Button, Badge, TextInput, Divider, Card.
- [ ] `app/tabs/moments.tsx:4` — PageHeader, NewProject, SamplePackCard, MomentCard, Loading, EmptyState.
- [ ] `app/tabs/library.tsx:4` — EmptyState, PageHeader, Button, NewProject, ProjectCard, Loading.
- [ ] `app/tabs/account.tsx:13` — PageHeader, Avatar, Button, TextInput, Divider, Badge, Loading.
- [ ] `app/tabs/settings.tsx:5` — PageHeader, Avatar, Divider, Badge, Button, CardRow.
- [ ] `app/tabs/modes.tsx:4` — PageHeader, Card, CardIcon, Divider.
- [ ] `app/mastering/index.tsx:4` — MasteringSuite, Sidebar, MobileDrawer, EmptyState, Button.
- [ ] `app/studio/[id].tsx:44` and `app/studio/StudioModals.tsx:21` — read files, convert barrel imports to direct.
- [ ] 14 web 3D files (`app/virtual-studio.tsx`, `app/{beatmaker,dj-stage,vocal-booth,autotune,mixing-console,lofi-tape,cover-jam,synth-lab,stem-collider,live-room,spatial-audio,acoustics}.tsx`, `app/explorer.tsx`) — `Screen3DFallback` (+ `Screen3DHeader` in `explorer.tsx`) from `../../src/components/Screen3DFallback`.
- [ ] Verify: `npx tsc --noEmit` clean; no barrel import (`from "../src/components"` or `from "../../src/components"`) remains in `app/`.

### 3. Defer `lamejs`
- [ ] `src/lib/audio.ts`: remove `import { Mp3Encoder } from "lamejs"` (line 1); add `const { Mp3Encoder } = await import("lamejs");` inside `audioBufferToMp3BlobAsync` (before line 119's usage).
- [ ] Verify `audioBufferToMp3BlobAsync` callers already `await` it (it returns a Promise today).

### 4. Defer `pluginChain`
- [ ] `src/lib/universalAudio.ts`: remove `import { applyPluginChain } from "../lib/pluginChain"` (line 4); add `const { applyPluginChain } = await import("../lib/pluginChain");` at the call site (line 355, already inside an async mixdown path).
- [ ] Keep `resolveAssetUrl` static.

### M1 gate
- [ ] `npx tsc --noEmit` (zero errors)
- [ ] `cd backend && npx tsc --noEmit`
- [ ] `npx vitest run` (all pass)
- [ ] `npm run test:legacy`
- [ ] `npm run build`
- [ ] Run `code-review` subagent before commit.

## M2 — Web route-level code splitting (gated, last)

### 5. Enable `asyncRoutes`
- [ ] `app.json` plugins: replace `"expo-router"` with `["expo-router", { "asyncRoutes": { "web": true, "default": "development" } }]`. Keep `web.output: "single"`.
- [ ] `npx expo export --platform web --clear` succeeds. `dist/_expo/static/js/web/` contains `entry-*.js` **plus route chunks** (not a single file).
- [ ] Assert lazy loading: `grep -L "soundfont-player|lamejs|midiSynth|beatmaker|synth-lab|mixing-console" dist/_expo/static/js/web/entry-*.js` — none present in the entry chunk.
- [ ] Record new entry raw/gzip size; compare to M0 baseline (target ≥ 40% entry reduction; if not met, note the shortfall).
- [ ] Manual smoke (web): feed renders without 3D/studio chunks in network tab; Virtual Studio hub → furniture → tool room renders (chunk + CDN three load on demand). Manual smoke (native dev): app boots, fallback screens intact.
- [ ] **Gate:** if export or smoke fails, revert the `app.json` plugin entry to `"expo-router"` (keep M1). Re-run full verification.

## M3 — Docs & final verification

- [ ] Update `docs/features-implementation.md`: record the lazy-loading strategy (asyncRoutes on web, direct-import/dynamic-import trimming on all platforms, AudioEngineProvider removal).
- [ ] Create `openspec/specs/startup-lazy-loading/spec.md` capturing shipped behavior + measured entry sizes (baseline vs after).
- [ ] Update `openspec/changes/vercel-performance/tasks.md` task 6 to note it is subsumed by this change (leave tasks 7-8 open).
- [ ] Run `code-review` subagent.
- [ ] Full gate re-run: `npx tsc --noEmit`, `cd backend && npx tsc --noEmit`, `npx vitest run`, `npm run test:legacy`, `npm run build`.
- [ ] Commit & push: spec commit first (this directory), then implementation commit (M1+M2+M3).
