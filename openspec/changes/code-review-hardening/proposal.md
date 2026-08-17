# Proposal: code-review-hardening — Fix HIGH + MED Repo-Wide Findings

> **Status: PROPOSED.** Not yet approved or implemented. Writing task only — no
> source edits, no test runs. LOW-severity convention nits (comment removal,
> `any`-sprawl) are explicitly OUT of scope.

## Context

A full-repo code review produced a prioritized list of defects. This change
addresses every **HIGH** and **MEDIUM** severity finding that is a genuine
correctness, resource-leak, or security defect. It deliberately excludes LOW
severity convention nits (stray comments, `any`-sprawl) per the task scope.

The findings cluster into four domains: Audio Engine & DSP, State &
Collaboration, UI / 3D, and Backend. Each is a concrete, localized fix with a
clear root cause and a deterministic verification path. Several items
(`wasmPluginHost`, `wasmInstrumentEngine`, `timeStretchVocoded`) are currently
dead code but must be correct if/when wired — they carry the same latent
crash.

## Problem Description

### AUDIO ENGINE & DSP (HIGH + MED)
- **H1.** `AudioWorkletNode` is constructed without first `await ctx.audioWorklet.addModule(url)`, and the module URL is revoked immediately → "processor not registered" crash on first render. Present in `src/lib/wasmPluginHost.ts:224-226`, `src/lib/wasmInstrumentEngine.ts:370`, `src/lib/timeStretchVocoded.ts:437`.
- **H2.** `renderMidiNotesNative` (`src/lib/midiSynth.ts:251`) hardcodes `beatDuration = 60/120`, ignoring project `bpm`; the native fallback caller at `:1014` never passes it.
- **M1.** `src/lib/clockManager.ts:59` revokes the worker blob URL immediately after `new Worker(url)`; some browsers abort the fetch.
- **M2.** `OfflineAudioContext` is never `.close()`d after `startRendering()` in `src/lib/mastering.ts` (every `apply*`), `src/lib/pluginChain.ts` (`applySinglePlugin`/`applyAutoPitch`), `src/lib/midiSynth.ts` (`renderTracksToUrl`/`renderTrackStem`/`renderTrackBuffer`), `src/lib/previewEngine.ts:~229` (`generateThumbnail`). Leaks GPU/audio resources.
- **M3.** `renderMixdownNative` (`src/lib/universalAudio.ts:~443`) lacks a `duration <= 0` guard (web path guards at `~369`).
- **M4.** `src/lib/chunkedRenderer.ts:~274` and `src/lib/transientDetection.ts:~85` allocate a throwaway `OfflineAudioContext` just to call `createBuffer`.
- **M5.** `src/lib/audioTelemetry.ts:~85` reuses `peakCpu` as a running max, which is misleading; a true peak across the window is needed.

### STATE & COLLABORATION (HIGH + MED)
- **H3.** `src/lib/crdt.ts` — concurrent `*.add` ops resolve as conflict and drop one op (lost update). The `*.add` handlers (~97-99) must be commutative set-inserts keyed by `value.id`.
- **H4.** `timestamp` (`src/lib/crdt.ts:34,68-69`) is a per-client local counter, not a Lamport clock; `mergeOperations` (`:42`, sort at `:73`) sorts by raw scalar across replicas → divergent, non-deterministic merges.
- **H5.** `mergeBranch` (`src/lib/projectBranching.ts:283`) overwrites `main.state` with a deep copy of `branch.state`, discarding rejected changes.
- **H6.** `src/lib/projectStore.ts` — web save queues every project in `pendingBridgeSaves` (`:46`) and retries forever; `checkBridge()` (`:60`) caches `false` → unbounded growth (`:87`).
- **M6.** `src/lib/presence.ts` & `src/lib/collaboration.ts` — reconnect timer stacking + duplicate `EventSource` leak (no `connectingRef` guard, no clear-before-set).
- **M7.** `src/lib/supabaseRemote.ts:~219` — `syncProject` on divergent remote sets `conflicts=1` and neither pushes nor pulls.
- **M8.** `setOnProjectSaved` (`src/lib/projectStore.ts:56`) and `onRegistryStateChange` (`src/lib/commandRegistry.ts`) store a single global callback (last wins).
- **M9.** Empty `catch {}` without captured `e` in `src/lib/crdt.ts:153`, `src/lib/collaboration.ts:~47,75,123,321`, `src/lib/presence.ts:~55,65,192`, `src/lib/projectStore.ts:~376,396`, `src/lib/busRouter.ts:~92,93,96,99`.

### UI / 3D (HIGH + MED)
- **H7.** All 13 3D screens — outer effect cleanup is `() => { cleanup?.(); }` and never sets `cancelled = true`; if unmounted before `loadThree()` resolves, scene + rAF + listeners leak. Present at `app/virtual-studio.tsx:337`, `app/dj-stage.tsx:318`, `app/autotune.tsx:~332`, `app/mixing-console.tsx:~673`, `app/vocal-booth.tsx`, `app/beatmaker.tsx`, `app/lofi-tape.tsx`, `app/cover-jam.tsx`, `app/synth-lab.tsx`, `app/stem-collider.tsx`, `app/live-room.tsx`, `app/spatial-audio.tsx`, `app/acoustics.tsx`.
- **H8.** `app/mixing-console.tsx:~654` — `resize` listener added but never removed.
- **H9.** `src/components/GenerateCoverModal.tsx:269` — direct `window.electronAPI` access bypasses `@bridge` (also counted as backend bridge-boundary H10).
- **M10.** `src/lib/sceneLighting.ts` + 3D scenes — geometries/materials/`CanvasTexture`s never disposed on unmount (only `renderer.dispose()`).
- **M11.** `src/lib/aiAutoMixAnalysis.ts:~73` — reads `getChannelData(0)` with no `numberOfChannels > 0` guard → crash on 0-channel buffer.

### BACKEND (HIGH + MED)
- **H10.** `src/components/GenerateCoverModal.tsx` bridge boundary — same as H9 (frontend file; counted once).
- **M12.** `backend/src/routes/generator.ts:75-76` — `GENRE_PATTERNS.pop` / `DRUM_PATTERNS.pop` are `undefined` (they are `Record`s, not arrays, defined at `:25`/`:38`) → `TypeError`/500 on non-matching prompts.
- **M13.** Auth gaps: `backend/src/routes/collab.ts` + `presence.ts` SSE/op endpoints have no `requireAuth`; `backend/src/routes/extract.ts:~196` `/api/stems/:filename` and `backend/src/routes/master.ts:~167` `/api/master/download/:filename` are unauthenticated.
- **M14.** `backend/src/services/queue.ts:~54` — `processJobAsync` writes orphaned `mock_*.wav` and the `jobs` Map grows unbounded.
- **M15.** `backend/src/routes/extract.ts:~33` — if `fd.read` throws after `fs.promises.open`, fd never closed; `~78` `catch { return 0; }` swallows the error.
- **M16.** `backend/src/routes/generator.ts:~64` — handler has no `try/catch`; exceptions leak stack traces via default handler.

## Objectives

1. Eliminate crash-class defects (H1, H2, H5, H7, H9/H10, M11, M12) that cause
   runtime exceptions or broken exports.
2. Close resource leaks (M1, M2, M4, M6, M10, M14) that degrade long sessions,
   exhaust GPU/file handles, or multiply network connections.
3. Fix correctness/data-integrity defects in CRDT/collaboration (H3, H4, H6, M7,
   M8, M9) so concurrent edits and remote sync do not lose or diverge data.
4. Harden backend auth + error handling (M13, M15, M16) to prevent unauthorized
   downloads and stack-trace disclosure.

## Non-Goals

- LOW severity convention nits (comment removal, `any`-sprawl) — out of scope.
- New features or refactors beyond the minimal fix for each finding.
- Native (expo-audio) playback path — unaffected by these findings.
- Rewriting the CRDT into a production consensus protocol — only the minimal
  Lamport-clock + commutative merge fixes required for deterministic convergence.

## Approach Summary

Group fixes by the four domains. Each fix is localized to the file/function cited
above, follows existing patterns, introduces no new dependencies, and passes the
full verification matrix without regressions. Dead-code worklet fixes (H1) are
made correct so they do not crash when wired, but are not otherwise activated.

## Risks

- CRDT Lamport-clock change (H4) must remain backward compatible with in-flight
  operations; bump the op schema version and guard sorting by `(lamport, clientId)`.
- Backend auth (M13) must not break legitimate SSE connections from the web
  client; verify presence/collab endpoints still connect with a valid session.
- 3D disposer (M10) must not double-dispose shared geometries reused across
  frames; traverse once on unmount only.
