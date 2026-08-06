# Tasks — Document Plugin Specs + Test Coverage

## 1. Spec scaffolding
- [x] Create `openspec/specs/audio-plugins/spec.md` (use provided content)
- [x] Create `openspec/specs/mastering-plugins/spec.md` (use provided content)
- [x] Create `openspec/changes/document-plugin-specs/{proposal,design,tasks}.md`
- [x] Run `openspec validate` and fix any structural errors

## 2. Test gaps (assign to Opencode agent per module) — OPEN WORK
- [ ] `src/lib/plugins/eq.ts` — add Vitest: 8-band clamp + Q bounds
- [ ] `src/lib/plugins/gate.ts` — add Vitest: 5 presets load, hysteresis logic
- [ ] `src/lib/plugins/autopitch.ts` — add Vitest: 6 presets, key/scale mapping
- [ ] `src/lib/plugins/mbcomp.ts` — add Vitest: 4-band crossover sums to unity
- [ ] `src/lib/plugins/tplimiter.ts` — add Vitest: true-peak never exceeded
- [ ] `LufsMeter` — add Vitest: silence floor + −14 dBFS tone tolerance
- [ ] `MixManager` — add Vitest: 4 snapshots deep-equal round-trip
- [ ] `VisualEQ` — add Vitest: band drag → EQ param write

## 3. Coverage target — OPEN WORK
- [ ] Each of the 19 plugin files has ≥ 3 Vitest cases (schema, preset, process)
- [ ] Total new tests: ~60 (keeps suite at ~565, under CI timeout)
- [ ] `npx tsc --noEmit` clean before marking done

## 4. Agent handoff (guidance)
Each task in §2 is a standalone Opencode prompt:
"Read openspec/specs/audio-plugins/spec.md Requirement '19 Plugin Types'
 row N. Write Vitest covering paramSchema clamp + preset load in
 src/lib/plugins/<file>.ts. Run npx vitest run <file>."

## 5. Additional missing spec areas (append new specs to repo)
Each area below now has a `openspec/specs/<area>/spec.md`. [x] means the spec
file exists (verified in the repo); any still-unbuilt underlying feature is
called out inline.

- [x] `specs/collaboration-crdt/` — Real-time collaboration & CRDT sync (operation-based merge, SSE/WebSocket, presence cursors). `src/lib/crdt.ts`, `yjsCRDT.ts`, `collaboration.ts`, `presence.ts`, backend `routes/collab.ts`.
- [x] `specs/project-branching/` — Git-like CRDT fork/merge/diff, named branches, snapshot compaction, A/B commit history UI. `src/lib/projectBranching.ts`, `snapshotManager.ts`, `src/components/BranchManager.tsx`, `CommitModal.tsx`, `VersionHistory.tsx`.
- [x] `specs/project-storage/` — Project persistence, `.openband` binary archive w/ CRC32, asset separation w/ S3 pointers. `src/lib/projectStore.ts`, `openbandFormat.ts`, `stateAssetSeparation.ts`.
- [x] `specs/cloud-sync/` — Supabase remote push/pull, hash dedup, storage bucket sync. `src/lib/cloudSync.ts`, `supabaseRemote.ts`, `supabase.ts`, backend `routes/projects.ts`, `stems.ts`, `trash.ts`.
- [x] `specs/auth/` — Supabase auth, visitor/anon mode, magic-link, account conversion, tier gating. `src/context/AuthContext.tsx`, backend `routes/auth.ts`, `magicLink.ts`, `tier.ts`, `middleware/authMiddleware.ts`, `tierGuard.ts`.
- [x] `specs/backend-api/` — Full Express surface: stem extraction (Demucs/mock/queue), master bounce, contextual MIDI generator, sessions, remix, export, mixing templates, hydration. `backend/src/app.ts`, `routes/*`, `services/demucs.ts`, `mock.ts`, `queue.ts`, `middleware/upload.ts`.
- [x] `specs/social-feed/` — Feed timeline, artist moments, sample-pack store, project cards. `app/tabs/index.tsx`, `moments.tsx`, `src/components/FeedPostCard.tsx`, `MomentCard.tsx`, `SamplePackCard.tsx`, `ProjectCard.tsx`.
- [x] `specs/hardware-io/` — Multi-channel device enumeration, drag-and-drop hardware I/O matrix, output selection. `src/lib/hardwareIO.ts`, `src/components/Patchbay.tsx`, `OutputSelector.tsx`.
- [x] `specs/wasm-plugins/` — JSON-RPC Wasm plugin loader, unified AudioWorklet synth/sampler engine. `src/lib/wasmPluginHost.ts`, `wasmInstrumentEngine.ts`.
- [x] `specs/command-palette/` — Central command registry, Cmd+K palette, shortcut engine. `src/lib/commandRegistry.ts`, `keyboard.ts`, `src/components/CommandPalette.tsx`.
- [x] `specs/waveform-rendering/` — Peak-data generation, Canvas 2D waveform renderer, viewport culling, live waveform. `src/lib/canvasWaveform.ts`, `src/components/WaveformCanvas.tsx`, `LiveWaveformCanvas.tsx`, `WaveformClip.tsx`.
- [x] `specs/automation-routing/` — Volume/param automation lanes, sub-mix bus graph builder, DAG cycle validation, LFO/envelope/macro modulation matrix. `src/lib/automationEngine.ts`, `busRouter.ts`, `audioGraphValidation.ts`, `modulationMatrix.ts`.
- [x] `specs/midi-pipeline/` — MIDI file parsing, Web Audio synth bus routing, lookahead sample-accurate scheduler. `src/lib/midiParser.ts`, `midiSynth.ts`, `midiScheduler.ts`.
- [x] `specs/audio-dsp/` — Subtractive synth, pedal DSP, phase-vocoder WSOLA time-stretch, granular pitch-independent stretch, transient slicing. `src/lib/subtractiveSynth.ts`, `pedalboardDsp.ts`, `timeStretchVocoded.ts`, `timeStretch.ts`, `transientDetection.ts`.
- [x] `specs/ai-automix/` — Stem analysis (LUFS/spectral/transient), genre auto-mix presets, harmonic assistant, music theory helpers. `src/lib/aiAutoMixAnalysis.ts`, `automix.ts`, `harmonicAssistant.ts`, `harmony.ts`.
- [x] `specs/project-templates/` — Genre/mood/key templates, track generation, 3-step New Project flow. `src/lib/projectTemplates.ts`, `src/components/NewProject.tsx`.
- [x] `specs/studio-resilience/` — Crash recovery, audio underrun/CPU telemetry, latency monitoring. `src/lib/crashRecovery.ts`, `audioTelemetry.ts`, `latencyMonitor.ts`.
- [x] `specs/immersive-studio/` — Spec created. Spatial audio, acoustics, scene lighting, asset/avatar systems for themed studio rooms. `app/virtual-studio.tsx`, `spatial-audio.tsx`, `acoustics.tsx`, `src/lib/sceneLighting.ts`, `loadThree.ts`, `habboAssets.ts`. Note: the 3D hub + spatial/acoustics/lighting screens ARE implemented; the `habboAssets.ts` isometric/avatar asset system is NOT yet wired into any screen (documented in the spec as NOT IMPLEMENTED).

## Remaining open work (post-§5)
- §2 per-plugin Vitest cases (8 items listed above) — UNCONFIRMED, treat as open.
- §3 coverage target (19 plugins × ≥3 cases, ~60 new tests, `tsc` clean).
