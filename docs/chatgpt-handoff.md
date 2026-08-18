# ChatGPT Handoff — OpenBand Architecture Planning

> **Feed this to ChatGPT.** Copy this file's contents into a ChatGPT project session and ask it to plan/architect the next development phase. It contains everything ChatGPT needs: product scope, the 5-domain architecture, key libraries with exact file paths, the desktop-bridge and 3D scene patterns, the verification & convention harness, the round-2 hardening already completed, and a prioritized next-steps backlog with entry-point files. Do **not** ask ChatGPT to edit code until it has read `AGENTS.md` (linked in §11).

---

## 1. What is OpenBand

OpenBand is an open-source, cross-platform **DAW** (Digital Audio Workstation) — web-first, also Android/iOS/Electron desktop. It provides a full creative DAW surface: multi-track recording/playback, 19-type plugin DSP, mastering suite, stem separation (Demucs), piano roll, sampler, synth, looper, chord track, automation lanes, CRDT real-time collaboration, command palette, project branching, and a 3D isometric virtual studio with 12 tool rooms.

**Stack tags:** Expo Router (SDK 57) · React Native Web 0.86 · NativeWind / Tailwind v3 · TypeScript (strict, `~6.0`) · `expo-audio` (not `expo-av`) · Web Audio API + AudioWorklets + WASM · Supabase (prod) / SQLite (dev) · Express backend (Demucs stem separation) · Electron 35 desktop (swappable bridge) · Three.js 0.160 (runtime CDN load) · Vitest 4 · Playwright · i18next (en/es/pt).

---

## 2. Architecture at a Glance — Five Domains

OpenBand is organized around five domain-boundary agent specializations (see `AGENTS.md` §"Domain-Driven Agent Architecture"):

| Domain | Focus | Ownership | Key Inter-Agent Channels |
|---|---|---|---|
| **A. UI & Rendering** | HTML5 Canvas, DOM, timeline interactions, 60fps visuals | Pedalboard/knob UX, waveform canvas, 3D scene visuals | Sends high-level commands to Audio Engine via `MessagePort`; reads playhead/VU from `SharedArrayBuffer` |
| **B. Audio Engine & DSP** | Web Audio API, AudioWorklets, WASM, audio routing | Heavy DSP, mixing, offline render | Headless — never touches UI thread; exposes params via `MessagePort` |
| **C. State & Collaboration** | App state, multi-user sync, history | CRDT, undo/redo, project persistence | Broadcasts inverse ops to collaborators via WebSockets; syncs via SSE |
| **D. Media Processing & AI** | Async CPU/GPU-intensive backend tasks | Stem separation, waveform pre-calc, normalization, AI generation | Listens for backend events (e.g. `AssetUploaded`) via event-driven Pub/Sub |
| **E. Core Infrastructure & API** | Backend ops, database, storage, auth | REST APIs, Supabase, S3/R2 presigned URLs, auth guards | Publishes events; owns `backend/src/` |

**Inter-agent communication patterns:**
1. **Headless Audio Engine** — UI sends commands via `MessagePort`; never touches `AudioBuffer` directly.
2. **SharedArrayBuffer** — Audio Engine writes playhead/VU positions to a shared buffer; UI reads on animation frame (no message lag).
3. **Event-Driven Backend (Pub/Sub)** — Media Processing Agent is never called synchronously; Infrastructure Agent publishes events and Media Agent listens.
4. **Command Pattern + CRDT Integration** — Every action has an inverse for Undo; State Agent broadcasts inverses to collaborators via WebSockets.

**Frontend boundaries:**
- `src/bridge/` — All native desktop I/O goes through `OpenBandNative` from `@bridge`. Never `require('fs')`, `ipcRenderer`, or Tauri APIs in `src/` frontend.
- `app/` — Expo Router screens. The Studio (`app/studio/[id].tsx`) is the DAW; `app/virtual-studio.tsx` is the 3D hub.
- `src/components/` — 79-component design system (`src/components/index.ts`).
- `src/lib/` — 77 modules (audio, midi, dsp, state, sync, etc.).
- `src/hooks/` — thin wrappers (`useUniversalAudio`, `useKeyboardShortcuts`, etc.).

---

## 3. Key Libraries & Services

| Module | Role |
|---|---|
| `src/lib/universalAudio.ts` | Singleton `UniversalAudioSystem`: lazy `AudioContext`, multi-track mixdown via `OfflineAudioContext` (web) / bridge fallback (native), cross-platform file export. |
| `src/lib/wasmInstrumentEngine.ts` | Unified WASM synth/sampler in `AudioWorklet` — sample-accurate MIDI, dual-oscillator subtractive engine. |
| `src/lib/wasmPluginHost.ts` | WASM plugin loader, `IPlugin` interface, JSON-RPC `MessagePort` protocol; 19 plugin types via `pluginChain.ts`. |
| `src/lib/crdt.ts` | Operation-based CRDT with Lamport timestamps + LWW conflict resolution; foundation for real-time sync. |
| `src/lib/projectBranching.ts` | Git-like fork/merge/diff for CRDT state; selective merge acceptance; branch isolation. |
| `src/lib/clockManager.ts` | Web Worker master clock for metronome (25ms tick interval); tracks beat position during playback. |
| `src/lib/busRouter.ts` | Sub-mix bus routing graph builder; auto-assigns tracks to buses on creation; DAG validation. |
| `src/lib/automationEngine.ts` | Web Audio automation scheduling (linear/exponential curves); wired into studio playback. |
| `src/lib/projectStore.ts` | Project persistence (localStorage + bridge); `.openband` archive save/load. |
| `src/lib/aiAutoMixAnalysis.ts` | Stem analysis (LUFS, spectral balance, transient density); role classification (kick/snare/hihat/bass/vocal/lead/pad/keys/guitar/fx/other). |
| `src/lib/hardwareIO.ts` | Multi-channel hardware I/O enumeration, patchbay routing; Web MIDI on web, bridge on desktop. |
| `src/lib/commandRegistry.ts` | Centralized command registry, keyboard shortcut engine, Cmd+K palette dispatch. |
| `src/lib/openbandFormat.ts` | `.openband` binary archive format with CRC32 integrity validation; state/asset separation. |
| `src/lib/latencyMonitor.ts` | Direct input monitoring; re-entrant guard for mic stream lifecycle. |
| `src/lib/audioTelemetry.ts` | Ring buffer for underruns/CPU metrics with server reporting; peak CPU accumulator. |
| `src/lib/modulationMatrix.ts` | LFO/envelope/macro modulation routing (11 sources × 11 targets); `computeModulation`. |
| `src/lib/snapshotManager.ts` | CRDT snapshot compaction + state management; full snapshot lifecycle. |
| `src/lib/collaboration.ts` | Real-time collaboration hook with CRDT sync; SSE broadcast; offline-op queue. |
| `src/lib/yjsCRDT.ts` | Legacy CRDT (operation-based, WebSocket sync) — superseded by `crdt.ts`; scheduled for deletion. |
| `src/lib/timeStretchVocoded.ts` | Phase Vocoder / WSOLA time-stretch AudioWorklet with FFT (2048 frame, 512 hop). |
| `src/lib/timeStretch.ts` | Pitch-independent time-stretch via granular synthesis (2048 grain, 512 hop, Hann window). |
| `src/lib/stateAssetSeparation.ts` | OpenBandManifest v2 with S3 URL pointers, SHA-256 commit hashing. |
| `src/lib/supabaseRemote.ts` | Push/pull/sync with asset deduplication via SHA-256 hash check; remote-preferring rebase. |
| `src/lib/previewEngine.ts` | Decoupled `AudioContext` for debounced sample preview + thumbnail generation. |
| `src/lib/transientDetection.ts` | Audio transient detection + slicing utilities for sampler/chop workflow. |

**Also notable:** `audio.t.ts` (audio type defs), `midiParser.ts`, `midiSynth.ts`, `midiScheduler.ts`, `subtractiveSynth.ts`, `chunkedRenderer.ts`, `audioGraphValidation.ts`, `timelineGestures.ts`, `objectStorage.ts`, `cloudSync.ts`, `cloudVault.ts`, `settingsStore.ts`, `presence.ts`, `sceneLighting.ts`, `canvasWaveform.ts`, `videoExport.ts`, `voiceCommands.ts`, `pitchEstimate.ts`, `keyDetection.ts`, `harmony.ts`, `genreTree.ts`, `arrangement.ts`, `arrangementGenerator.ts`, `autotune.ts`, `flags.ts`, `constants.ts`, `crashRecovery.ts`, `creativeModes.ts`, `dawproject.ts`, `dawprojectExport.ts`, `feedApi.ts`, `i18n.ts`, `keyboard.ts`, `mastering.ts`, `masteringBridge.ts`, `masteringSuite.ts`, `mcu.ts`, `mcuController.ts`, `midiLearn.ts`, `midiShared.ts`, `playheadStore.ts`, `pluginChain.ts`, `regionEdit.ts`, `responsive.ts`, `stemExtractor.ts`, `stemManifest.ts`, `sync.ts`, `timbreRegistry.ts`, `automix.ts`, `history.ts`, `types.ts`, `loadThree.ts`, `habboAssets.ts`, `projectTemplates.ts`, `projectEncryption.ts`, `projectStarter.ts`, `audio.ts`, `apiUrl.ts`, `tier.ts`.

---

## 4. Desktop Bridge

All native desktop capabilities go through `src/bridge/`. The frontend has zero knowledge of whether it runs in Electron, Tauri, or a browser.

| File | Role |
|---|---|
| `src/bridge/interface.ts` | Contract — `NativeBridge` interface with all method signatures (file dialogs, `showOpenDialog`, `saveFile`, `runVoiceCleaner`, MIDI events, hardware I/O, etc.) |
| `src/bridge/electron.ts` | Electron impl — delegates to `window.electronAPI` (exposed via `electron/preload.js`); IPC handlers in `electron/main.js` |
| `src/bridge/tauri.ts` | Tauri stub — placeholder for future migration; all methods `warn + return null` |
| `src/bridge/browser.ts` | Browser fallback — uses `localStorage`, `document.createElement('a')`, etc. |
| `src/bridge/index.ts` | Auto-detect: `window.electronAPI` → Electron, `__TAURI__` → Tauri, else browser |

**Usage in frontend:**
```ts
import { OpenBandNative } from '@bridge';
const path = await OpenBandNative.showOpenDialog({ filters: [...] });
```

**Native hardware I/O:** `hardware-io-native` change added 6 bridge methods (enumerate devices, patchbay routes). Verify IPC handlers exist in `electron/main.js` and wire to `Patchbay` component (`src/components/Patchbay.tsx:63` isWeb → bridge pattern).

---

## 5. 3D / Three.js Scenes

**Web-only.** Native platforms render `Screen3DFallback` (`src/components/Screen3DFallback.tsx`). See `docs/3d-scene-guidelines.md` for the full T1–T10 target playbook — read it before editing any 3D screen.

- **Runtime CDN load:** `src/lib/loadThree.ts` — memoized single-flight loader for `three@0.160.0` (cascading unpkg → cdnjs → jsdelivr). Screens use the returned `THREE` object — **no static `from "three"` import** (breaks SSR + native).
- **Hub:** `app/virtual-studio.tsx` (tab shell: `app/tabs/virtual-studio.tsx`) — isometric `OrthographicCamera`, 12 `FurnitureDef` routed via Raycaster click → `router.push(route)`, local "You" avatar (WASD), `LightControls` ref bubbling color to scene lights (no React state in rAF loop).
- **12 tool rooms:** `app/beatmaker.tsx`, `dj-stage.tsx`, `vocal-booth.tsx`, `autotune.tsx`, `mixing-console.tsx`, `lofi-tape.tsx`, `cover-jam.tsx`, `synth-lab.tsx`, `stem-collider.tsx`, `live-room.tsx`, `spatial-audio.tsx`, `acoustics.tsx` — perspective camera + custom spherical-drag orbit + wheel/pinch zoom, `ACESFilmicToneMapping` (all except `beatmaker.tsx`).
- **Lighting rigs:** `src/lib/sceneLighting.ts` (`addSceneBulb` pendant, `addRGBStrip` neon) — all procedural; **no HDRI/texture/model assets** in the repo.
- **Render is reflection, never engine.** The rAF loop NEVER computes audio/DAW state (no gain, EQ, automation, sync). Scene runs its own clock, decoupled from `clockManager`/AudioContext.
- **Lifecycle:** rAF canceled, listeners removed, `renderer.dispose()` + geometry/material/texture traverse-dispose on unmount (all 13 screens).
- **No post-processing** (no EffectComposer/SSAO/bloom/AgX); no adaptive resolution beyond `setPixelRatio(min(dpr, 2))`.

> Note: `src/lib/presence.ts` (SSE, DAW-editor cursors) is NOT yet connected to the 3D scene — avatar sync is aspirational.

---

## 6. Testing & Verification Harness

### OpenSpec SDD Loop (from `AGENTS.md`)

Every change follows three phases — **never skip or reorder:**
1. **Spec** — create `openspec/changes/<name>/{proposal,design,tasks}.md` (docs-only), commit & push *before* any code.
2. **Implement + test + code-review** — implement per `tasks.md`, write/update tests, run full verification matrix, pass `code-review` subagent. Commit separately.
3. **Archive + commit** — move specs to `openspec/archive/` with `## Status: SHIPPED` marker, commit.

### Verification Matrix (run in this order)

```bash
# 1. TypeScript check (frontend) — zero errors
npx tsc --noEmit

# 2. TypeScript check (backend) — zero errors
cd backend && npx tsc --noEmit

# 3. Vitest component + lib tests — all pass
npx vitest run

# 4. Legacy node:test suite — pass
npm run test:legacy

# 5. Architecture graph CI gate — CI PASS
npm run graph:ci

# 6. Production build — succeed
npm run build
```

**WSL execution note (from `AGENTS.md`):** Run git/tsc/vitest via `wsl -e bash -lc "cd /home/az1nn/openband && <cmd>"`. Vitest cannot run from the Windows UNC mount. Pure file edits may use the `\\wsl.localhost\...` UNC path; bash commands must not.

### Test counts (trust these)

- **Vitest:** ~1650 tests across ~91 files (current pre-regression-lock-in: 1479 across 83; the in-flight `regression-tests-round2` change adds 5 new guard suites targeting the HIGH/MED/LOW fixes from commit `0f3a45b`).
- **Legacy `node:test`:** 24 tests across 2 files (`tests/presets.test.ts` — 12, `tests/types.test.ts` — 12) via `npm run test:legacy` with `ok-reporter.ts` + `setup.ts`.
- **Playwright E2E:** `e2e/` + `playwright.config.ts`.
- **Storybook:** `stories/*.stories.tsx` (run: `npx storybook dev -p 6006`).

### Regression suites & exclusions

- **`tests/backend-routes.test.ts`** — **excluded from root vitest run** because it imports `express` (Node-only). The in-flight `regression-tests-round2` change will mock `express` in-process so it collects; until then, treat backend route tests separately. Run backend verification with `cd backend && npx tsc --noEmit` + manual `npm run dev` testing.
- **`tests/futureRoadmap.test.ts`** — currently uses `node:test` imports, not collected by vitest; `regression-tests-round2` will swap to vitest imports.
- **`tests/regression-round2-{audio,state,ui,backend,lib}.test.ts`** — new guard suites (in-flight) asserting post-fix behavior for each finding from commit `0f3a45b`.
- Rendering-only UI fixes (spatial-audio listener removal, emissive material, waveform resize, CommandPalette nav) are type-checked only — no exportable pure-logic helper for vitest.

### Test output format

Every test must follow the node:test pattern:
- `▶ SuiteName` for describe blocks
- `  ✔ test description (Xms)` for passing tests
- `✔ SuiteName (Xms)` at suite end

---

## 7. What's Already Hardened

Commit `0f3a45b` ("fix: code-review-round2") closed all HIGH/MED/scoped-LOW findings across six domains (see `openspec/archive/code-review-round2/proposal.md`). **Do not re-plan these.**

| Domain | Key fixes (commit `0f3a45b`) |
|---|---|
| **AUDIO** | Guarded `OfflineAudioContext.close()` after every render; guarded `audioWorklet.addModule()` with blob-URL revoke in `finally`; real `bpm` threading into native MIDI render; worker blob-URL revoke off the synchronous `new Worker` tick; sample-rate-keyed shared buffer context; separate true-peak CPU accumulator. |
| **STATE** | CRDT `*.add` merges commutatively (no lost update) with Lamport-clock ordering; `projectBranching.mergeBranch` applies modified tracks always + gates only added tracks by accept list, single `main.state` assignment, filtered `crdtOperations` log; bridge-save queue bounded; presence/collaboration reconnect + timer guards; `Set`-based listeners; `supabaseRemote` does remote-preferring rebase on divergence. |
| **UI/3D** | All 13 Three.js screens dispose on async unmount (cancelled flag + immediate teardown), remove resize listeners, traverse-dispose geometry/material/textures + `renderer.forceContextLoss()` via `sceneLighting.ts#disposeScene`; `GenerateCoverModal` uses `@bridge` `isElectron` instead of `window.electronAPI`; init failures logged; `aiAutoMixAnalysis` guards zero-length/zero-channel buffers. |
| **BACKEND** | SSE subscribe routes use `requireAuthQuery` (token via `Authorization` header OR `?token=` query — `EventSource` can't send headers); queue artifacts survive until job eviction; `extract.ts`/`master.ts` close file descriptors in `try/finally`; stem/master downloads require auth; generator/extract errors logged. |
| **LIB** | Keyboard `key` lowercased so `Delete`/`Backspace`/`Escape` match; unique plugin IDs across tracks (`plugin-${now}-${trackIdx}-${i}`); CRC32 mismatch in `openbandFormat.ts` throws (not just logs); offline decode uses `OfflineAudioContext` (not realtime); `OpenBandNative`-routed desktop file paths (no raw `window` API); i18n default `"en"`. |
| **LOW** | Empty `catch {}` → bind `e` + log; dead code removed; comment removal in touched files only. |
| **SPEC HYGIENE (S1–S4)** | Archived 15 leftover `openspec/changes/` dirs; reconciled contradictory status markers; standardized `## Status: SHIPPED` across all archived proposals. |

**Operational facts (from `AGENTS.md`):**
- `metro.config.js` keeps an `Expo.fx` stub (published `expo@57.0.4` omits `Expo.fx`).
- Asset module declarations live in `src/declarations.d.ts` — do **NOT** add `src/react-native.d.ts` (shadows real RN types → ~52-error cascade).
- `react-native@0.86` ships real type definitions.
- Verification order: `tsc` → backend `tsc` → `vitest` → `test:legacy` → `graph:ci` → `build`.
- Full-repo code review partitioned into 5 domains: Audio/DSP, State/Collab, UI/3D, Backend, 3D+lib.

---

## 8. Next Steps Backlog (Planned & Aspirational)

### ✅ Shipped next-product pillars (all marked complete in `openspec/archive/next-product-design/tasks.md`)

These are **already implemented** — verify they work, don't re-implement:

| Pillar | Entry-point files | Status |
|---|---|---|
| **Video Export** | `src/lib/videoExport.ts` (`renderVideoJob`), `src/components/BounceDialog.tsx` (`video: boolean` toggle), `src/lib/universalAudio.ts` (mixdown), `OpenBandNative` (desktop) | Shipped |
| **MIDI Learn + MCU** | `src/lib/midiLearn.ts` (`learnCC`, `midiMap`), `src/lib/mcu.ts` (`decodeMCUTimeout`), Web MIDI (browser) + `OpenBandNative` (native) | Shipped |
| **DAWproject Interop** | `src/lib/dawproject.ts` (`exportDAWproject`, `importDAWproject`) — pure XML/zip, no native dep | Shipped |
| **AI Voice Cleaner** | `src/lib/plugins/voiceCleaner.ts`, `src/lib/pluginChain.ts:89` (`voiceCleaner` case, pass-through on web), `src/lib/types.ts:94` (`PluginType` union), `src/bridge/interface.ts:20` (`runVoiceCleaner`), `app/extractor.tsx:63` (isWeb gate), `PluginEditor.tsx` | Shipped |
| **Instruments** | `src/lib/wasmInstrumentEngine.ts` (orchestral instrument pack in `INSTRUMENT_PRESETS`), tempo/signature global track UI surfacing `MetronomeSettings` | Shipped |

### ⚠️ In-flight (specs in `openspec/changes/` — pick up next)

| Item | Entry-point files | Status |
|---|---|---|
| **Regression test lock-in** (`regression-tests-round2`) | `tests/regression-round2-{audio,state,ui,backend,lib}.test.ts` (NEW) + edit `tests/backend-routes.test.ts` (mock `express`) + edit `tests/futureRoadmap.test.ts` (vitest imports) | PROPOSED — writing tests only |
| **Round-2 round-A governance** (`v8-round-a-governance`) | CI reconciliation, spec hygiene | PROPOSED |

### 🔮 Aspirational (no spec / stubs only)

| Item | Entry-point files | Status |
|---|---|---|
| **Web playback pipeline** (`web-player-studio-audio`) | `useUniversalAudio.ts`, `universalAudio.ts`, `app/studio/[id].tsx`, `app/tabs/index.tsx` (feed playback) | Known bugs: audio-region silence on web, pitch-shift not applied, blob URL leaks, beat drift (clock reads different AudioContext than `<audio>` element) |
| **Real plugin DSP** (`real-plugin-dsp`) | `src/lib/pluginChain.ts`, `src/lib/mastering.ts`, `src/lib/pedalboardDsp.ts`, `wasmPluginHost.ts` | 19 plugin types are stubbed; need correct Web Audio graphs + canonical param IDs (`PLUGIN_SPECS`) |
| **Real LUFS meter** (`real-lufs-meter`) | `src/lib/lufs.ts` (BS.1770 K-weighting, true peak), `src/components/LufsMeter.tsx` | Not yet implemented |
| **Modulation matrix wiring** (`wire-modulation-matrix`) | `src/lib/modulationMatrix.ts` (`computeModulation`), `src/components/PluginEditor.tsx`, `src/components/OneKnob.tsx` | Math done; not applied at playback time |
| **Native hardware I/O wiring** (`hardware-io-native`, `mount-patchbay`) | `src/lib/hardwareIO.ts`, `electron/main.js` (IPC handlers), `src/bridge/interface.ts` (6 new methods), `src/components/Patchbay.tsx` | Bridge methods added; need IPC + UI wiring |
| **Presence avatar sync** (`wire-collab-presence`) | `src/lib/presence.ts` (SSE), `app/virtual-studio.tsx`, `app/studio/[id].tsx` | `presence.ts` SSE not connected to 3D scene or DAW editor cursors |
| **First-run onboarding** (`first-run-onboarding`) | `src/components/OnboardingFlow.tsx`, `src/lib/projectStarter.ts`, `app/_layout.tsx` | Component created; persistence helpers pending |
| **i18n completeness** (`i18n-completeness`) | `src/lib/i18n.ts`, `src/locales/{en,es,pt}.json` | pt-BR default + namespace extensions pending |
| **CI pipeline** (`ci-pipeline`) | `.github/workflows/ci.yml` | Config written in design.md; not yet created |
| **AUv3 plugin support** | iOS-only native extension | Explicitly out of scope (mobile-irrelevant) |
| **Delete `yjsCRDT.ts`** (`remove-dead-yjscrdt`) | `src/lib/yjsCRDT.ts` | Dead code, superseded by `crdt.ts`; scheduled for deletion |

---

## 9. How to Add a Feature

### SDD change lifecycle

1. **Spec** — create `openspec/changes/<name>/{proposal,design,tasks}.md` (docs-only). Commit & push **before** any code. Each spec file gets `## Status: PROPOSED` at the top.
2. **Implement** — implement exactly what `tasks.md` specifies. Write/update tests. Use the design system (`src/components/`). Follow existing `View` + `className` patterns (no `StyleSheet.create`). No comments in code.
3. **Verify** — run the 6-step matrix (`tsc` → backend `tsc` → `vitest` → `test:legacy` → `graph:ci` → `build`). Run `code-review` subagent before committing.
4. **Archive** — prepend `## Status: SHIPPED` to `openspec/changes/<name>/proposal.md`, then `git mv openspec/changes/<name> openspec/archive/<name>`. Commit separately.

### Conventions to follow

- **No new dependencies** without approval — check `package.json` first.
- **No native desktop I/O in `src/`** — always through `OpenBandNative` from `@bridge`. (Rule `OB-GRAPH-001`: frontend modules importing Node/Electron/Tauri APIs directly = error.)
- **No code comments.** Self-documenting code only.
- **Tailwind v3 syntax** — use `@tailwind base/components/utilities` directives, NOT `@import "tailwindcss/..."` (v4).
- **Don't modify config files** (`tailwind.config.js`, `metro.config.js`, `babel.config.js`, `tsconfig.json`) unless explicitly required.
- **Update `docs/features-implementation.md`** when modifying visual layouts, themes, stylesheets, or core components.
- **Path aliases:** `@/` → root, `@bridge` → `src/bridge` (defined in `tsconfig.json`).
- **Design system:** Import from `src/components/`. 79 components available (see AGENTS.md §"Design System Reference" for full props table). CSS utility classes in `global.css`: `.card`, `.card-elevated`, `.btn-secondary`, `.input-field`, `.input-field-focused`, `.badge`, `.label`.
- **3D scenes:** Read `docs/3d-scene-guidelines.md` before editing any Three.js screen.

---

## 10. Branching & Workflow

- **PR-First:** Commit on feature branches (`agent/<issue>-<slug>` or `docs/<slug>`), push branch, open a Draft PR via `gh pr create`, await human review and merge. Never push directly to `master`.
- **Force-push allowed** on your own Draft branches (not on `master` or others' branches).
- **Spec commits separate from implementation commits** — each phase must be independently reviewable.
- **Always run `code-review` subagent before every commit.**
- **Active branches** (as of this writing): `docs/chatgpt-handoff` (this work), `docs/verification-sync`, `agent/v9-01-project-starter-preview`, `feature/vercel-fixes`, `master`.
- **Vercel deploy:** `git push` auto-deploys on push to `master`. For clean deploy (no cache): `npx vercel deploy --prod --force`.

### Session recovery

If a session goes bad: `git stash` (keep wanted work) → `git reset --hard HEAD` → `git clean -fd` → `git checkout master` → `git pull --ff-only origin master` → delete bad branch locally + remotely.

---

## 11. Where to Read Next

| Doc | Purpose |
|---|---|
| `AGENTS.md` | **Mandatory first read.** Full SDD loop, design-system reference (79 components with props), desktop bridge, 3D/Three.js rules, audio system, verification matrix, WSL execution notes, architecture quick-reference tree, domain-driven agent architecture. (~535 lines) |
| `docs/HY3-HANDOFF.md` | Previous handoff document (~260 lines) — complementary but drifts; this file supersedes it for ChatGPT planning. |
| `docs/roadmap.md` | Feature inventory (41 shipped, Phase 1 polish items, Phase 2–3 expansion, what NOT to work on). |
| `docs/features-implementation.md` | Build plan with phase-by-phase task breakdown, playback improvements, startup perf, studio audio/DSP correctness, hardening notes. (~527 lines) |
| `docs/3d-scene-guidelines.md` | **Mandatory** before editing any 3D screen. T1–T10 target playbook, lifecycle rules, lighting rigs, web-only constraint. |
| `docs/supabase.md` | Supabase setup guide (auth, schema, dev vs prod). |
| `docs/testing-mocks.md` | Vitest mock patterns, RNW type mismatches, common pitfalls, `importOriginal` safety rules. |
| `docs/graph-engineer.html` | Interactive architecture-graph visual developer guide. |
| `openspec/changes/` | In-flight specs (read `proposal.md` + `tasks.md` for active work). |
| `openspec/archive/` | Shipped specs (reference for conventions, conventions adopted, what's already hardened). |
| `CLAUDE.md` | Alias for `AGENTS.md`. |
| `stories/` | Storybook for all 79 components — run: `npx storybook dev -p 6006`. |
| `backend/src/index.ts` + `backend/src/routes/*` + `backend/src/services/*` | Express backend — stem extraction, mastering bounce, SSE presence/collab, MIDI generation. |
| `electron/main.js` + `electron/preload.js` | Electron main process — IPC handlers, context bridge. |
