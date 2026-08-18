# Design: ChatGPT Handoff Document

## Output
One file: `docs/chatgpt-handoff.md` (new), structured so an external ChatGPT
project can immediately plan/architect next steps.

## Sections
1. **What is OpenBand** — one-paragraph product summary + stack tags.
2. **Architecture at a glance** — the five-domain agent architecture
   (UI/Rendering, Audio/DSP, State/Collab, Media/AI, Infra/API) with ownership
   boundaries and inter-agent channels (MessagePort, SharedArrayBuffer, Pub/Sub,
   Command→CRDT).
3. **Key libraries / services** — short entries for the must-know modules:
   `universalAudio.ts`, `wasmInstrumentEngine.ts`/`wasmPluginHost.ts`,
   `crdt.ts`/`projectBranching.ts`, `clockManager.ts`, `busRouter.ts`,
   `automationEngine.ts`, `projectStore.ts`, `busRouter.ts`, `aiAutoMixAnalysis.ts`,
   `hardwareIO.ts`, `commandRegistry.ts`, `previewEngine.ts`, `timeStretchVocoded.ts`,
   `modularMatrix.ts`, `snapshotManager.ts`, `openbandFormat.ts`, `latencyMonitor.ts`,
   `audioTelemetry.ts`, `timeStretch.ts`, `transientDetection.ts`, `stateAssetSeparation.ts`,
   `supabaseRemote.ts`, `modulationMatrix.ts`, `yjsCRDT.ts`, `collaboration.ts`.
   Each entry: one line summary + file path.
4. **Desktop bridge** — `src/bridge/` contract (`NativeBridge`), Electron impl,
   Tauri stub, browser fallback, auto-detect; `OpenBandNative` usage in frontend.
5. **3D/Three.js scenes** — web-only (native → `Screen3DFallback`), runtime CDN
   loader `src/lib/loadThree.ts`, hub (`app/virtual-studio.tsx`) + 12 tool rooms,
   `src/lib/sceneLighting.ts`, lifecycle rules, no post-processing. (One paragraph;
   link `docs/3d-scene-guidelines.md`.)
6. **Testing & verification harness** — SDD loop, 6-step matrix
   (`tsc` → backend `tsc` → `vitest` → `test:legacy` → `graph:ci` → `build`),
   counts (1650/24, 91 files), the `tests/regression-round2-*` guard suites,
   `tests/backend-routes.test.ts` exclusion note, `docs/testing-mocks.md`.
7. **What's already hardened** — concise list of round-2 fixes so ChatGPT doesn't
   re-plan them; reference commit `0f3a45b`.
8. **Next steps backlog (planned)** — from `openspec/changes/next-product-design`:
   Video Export, MIDI Learn + MCU, DAWproject interop, AI Voice Cleaner; plus
   aspirational items (presence avatar sync, real plugin DSP stubs, native
   hardware I/O wiring). For each: one line + entry-point file(s) + status.
9. **How to add a feature (the harness)** — SDD change lifecycle, spec locations
   (`openspec/proposal|design|tasks` → commit → implement → archive → commit),
   `src/components/` design system, `@/bridge` alias, no-new-deps rule.
10. **Branching & workflow** — PR-first on feature branches, Draft PRs, force-push
    allowed on own Draft branches, two active branches context.
11. **Where to read next** — pointers to `docs/roadmap.md`,
    `docs/features-implementation.md`, `docs/3d-scene-guidelines.md`,
    `docs/supabase.md`, AGENTS.md architecture.
