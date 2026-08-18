# Proposal: code-review-round2 — Fix HIGH + MED + LOW Findings (Second Full-Repo Review)

> **Status: PROPOSED.** Writing task only — no source or spec edits. Covers the
> HIGH, MEDIUM, and scoped LOW findings from a second full-repo code review that
> follows the first `code-review-hardening` pass. LOW items are limited to: empty
> `catch {}` → bind + log, dead code removal, the specific LOW items noted, and
> removing code comments only inside files that are touched. No wholesale comment
> purges outside touched files. SPEC HYGIENE is a separate concern handled by its
> own subagent (S1–S4) and must NOT be marked SHIPPED here.

## Context

A second full-repo code review produced a prioritized list of defects across the
same five domains as the first pass (AUDIO, STATE, UI/3D, BACKEND, LIB/MISC) plus
a SPEC HYGIENE track. This change addresses every **HIGH**, **MEDIUM**, and the
explicitly-scoped **LOW** severity finding. Unlike the first pass, this change
also includes targeted LOW cleanups (empty catches, dead code, comment removal in
touched files) that were previously deferred.

Findings cluster into five code domains plus a spec-hygiene track:

- **AUDIO** — resource leaks (unclosed `OfflineAudioContext`, leaked mic stream),
  Wasm host/instrument correctness (btoa overflow, stale heap view, hardcoded
  sample rate, envelope reset), offline decode path, and time-stretch pitch bug.
- **STATE** — CRDT collaboration data-loss / stack-overflow, subscriber-wipe bug,
  snapshot/branching replay gaps, command-registry key collisions, and storage
  guards.
- **UI/3D** — leaked window/touch listeners, aiAutoMix precedence + empty-array
  NaN, empty catches, CommandPalette keyboard nav + shared TextInput, waveform
  resize redraw, emissive no-op, dead code blocks across 12 tool rooms.
- **BACKEND** — mock-WAV disk-fill, uploaded-file leak, download/presign IDOR,
  auth guards, header-sent guard.
- **LIB/MISC** — keyboard lowercasing bug, duplicate plugin IDs, CRC32/encryption
  overflow, desktop raw-window API usage, i18n fallback, and misc LOW cleanups.
- **SPEC HYGIENE (S1–S4)** — archive 15 leftover `openspec/changes/` dirs,
  reconcile contradictory status markers, add correction note, standardize
  SHIPPED markers (handled by a separate spec-only subagent).

Several fixes (H1, M1–M3, M7, M28–M31) touch code that may currently be
partially dead, but they carry real latent crashes and must be correct.

## Problem Description

### AUDIO (HIGH + MED + LOW)
- **H1.** `src/lib/chunkedRenderer.ts:191` — per-chunk `OfflineAudioContext` never closed. Fix: guarded `ctx.close().catch(e=>console.warn(...))` after `startRendering()`.
- **M1.** `src/lib/wasmPluginHost.ts:283` — `btoa(String.fromCharCode(...bytes))` stack overflow. Fix: build binary string in chunks.
- **M2.** `src/lib/wasmPluginHost.ts:105/127` — stale `_heapF32` after `memory.grow`. Fix: re-read `exports.memory.buffer` at start of `process()`.
- **M3.** `src/lib/wasmInstrumentEngine.ts:120` — hardcoded `sampleRate=44100`. Fix: add `setSampleRate(n)` called from renderer; use it for phase/env timing.
- **M4.** `src/lib/wasmInstrumentEngine.ts` — envelope resets each `render()` block. Fix: track running render clock / set `startTime` at note-on to engine time.
- **M5.** `src/lib/universalAudio.ts:321` — offline decode uses realtime ctx. Fix: decode on the OfflineAudioContext instead.
- **M6.** `src/lib/latencyMonitor.ts:75-116` — re-entrant `startDirectMonitor` leaks mic stream. Fix: guard `if (monitorState.enabled) return;` or stop previous first.
- **M7.** `src/lib/timeStretchVocoded.ts:233-234` — pitch-shift half-implemented (synthesisHop not rescaled). Fix: fold pitch into synthesisHop or document limitation.
- **LOW.** `src/lib/universalAudio.ts` (empty catches ~32,51,60,773,777), `previewEngine.ts:55`, `subtractiveSynth.ts` (catches 91-93,213-215,235-237,260-262 + disconnect on dispose), `modulationMatrix.ts:376,382`, `midiScheduler.ts:98,105` (also fix dead `alreadyScheduled`), `audioTelemetry.ts:130` (hardcoded 44100), `modulationMatrix.ts:428` (`lfoTime+=1/60` → real elapsed), `canvasWaveform.ts` — capture `e` in catches + remove comments. Remove comments in all audio files touched.

### STATE (HIGH + MED + LOW)
- **H2.** `src/lib/collaboration.ts:118-122,160` — offline ops deleted from IDB before `fetch`; flush failure = data loss. Fix: delete each entry by id only after its POST resolves; re-enqueue/keep on failure.
- **H3.** `src/lib/crdt.ts:104` — `Math.max(localClock, ...merged.map(...))` spreads unbounded array → stack overflow; `operationsRef` (collaboration.ts:145) never compacted. Fix: replace spread with a loop; cap `operationsRef` via `compactOperations` on merge.
- **H4.** `src/lib/projectStore.ts:58-66` — `setOnProjectSaved(null)` wipes ALL subscribers. Fix: return an unsubscribe fn; update callers (`useCloudSync`, `useAutoPush`) to use it; remove `setOnProjectSaved(null)` clears-all.
- **M8.** `src/lib/snapshotManager.ts:149-184` — `bus.add/remove/update` dropped on replay. Fix: add the missing `bus.*` cases (or reuse `crdt.applyOperation`).
- **M9.** `src/lib/projectBranching.ts:240-258,286-336` — incomplete accept-filter (only filters adds) + double-application (diff applied then crdtOperations merged). Fix: filter update/remove ops by accepted ids; drive merge from a single source.
- **M10.** `src/lib/collaboration.ts:347-356` (`applyToState`) — replays ops onto already-edited state. Fix: pass clean base or dedupe by `op.id` watermark.
- **M11.** `src/lib/commandRegistry.ts:318-338` — Space collision (play vs stop) + crossed undo/redo. Fix: distinct keys.
- **M12.** `src/lib/objectStorage.ts:78-89` — empty catch. Fix: `catch(e){console.warn(...)}`.
- **LOW.** `src/lib/busRouter.ts:90-109` (disconnect trackGain), `src/lib/stateAssetSeparation.ts:247` (history cap), `src/lib/cloudSync.ts`/`objectStorage.ts` unbounded Maps, `src/lib/crashRecovery.ts`/`cloudSync.ts` empty catches → bind+log, `src/lib/commandRegistry.ts:34` dead `activeBinding`, `src/lib/history.ts` useCallback. Remove comments in touched files.

### UI/3D (HIGH + MED + LOW)
- **H5.** `app/spatial-audio.tsx:240,250` — `window` mousemove/mouseup never removed. Fix: named handlers + `removeEventListener` in cleanup (mirror for touch handlers).
- **M13.** `src/lib/aiAutoMixAnalysis.ts:48` — precedence bug `||`/`&&`. Fix: parenthesize `(lower.includes("drum") && lower.includes("low"))`.
- **M14.** `src/lib/aiAutoMixAnalysis.ts:342-343` — empty `analyses` → NaN/−Infinity. Fix: early-return safe default.
- **M15.** `app/_layout.tsx:89`, `app/studio/[id].tsx:395`, `src/components/GenerateCoverModal.tsx:82` — empty catches. Fix: bind `e`+log.
- **M16.** `src/components/CommandPalette.tsx` — keyboard nav (↑↓/Enter/Esc) unimplemented. Fix: add `onKeyDown` on TextInput.
- **M17.** `src/components/MixManager.tsx:87` + `CommandPalette.tsx:70` — reimplement `TextInput`. Fix: use shared `TextInput`.
- **M18.** `src/components/WaveformCanvas.tsx:96-110` — no resize redraw. Fix: debounced ResizeObserver re-draw, removed in cleanup.
- **M19.** `app/virtual-studio.tsx:275` — `emissive` no-op on `MeshToonMaterial`. Fix: use `MeshStandardMaterial` or drive `color`.
- **M20.** `app/mixing-console.tsx:622` — fader caps drift (`+=` → absolute `baseY+bob`).
- **M21.** `app/dj-stage.tsx:279-283` — dead `scene.traverse` block. Fix: delete.
- **M22.** `app/cover-jam.tsx:196-204` — dead `isSpeedDial` branch. Fix: collapse to `intersectObject(speedDial)`.
- **M23.** 12 tool rooms: `addRGBStrip` `dotMat` unused — destructure only `{ stripMat }` (dj-stage:69, autotune:65, cover-jam:80, lofi-tape:69, live-room:69, synth-lab:273, stem-collider:84, acoustics:73).
- **LOW.** `src/lib/responsive.ts:20,32` comments; `app/studio/[id].tsx:2117` dead `+recordingTick*0`; `:1957` comment; `app/vocal-booth.tsx:330-331` redundant phi clamp; `app/virtual-studio.tsx:74` `lightRef` re-created each render → `useRef`; `spatial-audio.tsx:289`/`lofi-tape.tsx:509` `lastTime` unused; `stem-collider.tsx:162` unused; `Sidebar.tsx:143` simplify; `CommandPalette.tsx:21` `inputRef` unused; `GenerateCoverModal.tsx:60,69` dup base64 helpers; `beatmaker.tsx:334-335` `geometry.parameters.height` brittle (leave if correct). Remove comments in touched files.

### BACKEND (HIGH + MED + LOW)
(No HIGH.)
- **M24.** `backend/src/routes/extract.ts:146` + `services/queue.ts:135` — orphan mock WAVs disk-fill. Fix: remove the `addJob` call or make it the real producer returning jobId.
- **M25.** `backend/src/routes/extract.ts:183-188` — uploaded file leak on `DEMUCS_NOT_FOUND` inner catch. Fix: `cleanup(req.file?.path)` before 500.
- **M26.** `backend/src/routes/extract.ts:206` & `master.ts:172` — download IDOR (no ownership). Fix: scope filename to `req.userTokenData.userId`.
- **M27.** `backend/src/routes/storage.ts:30-47,49-66` — presign/head IDOR (any-key signing). Fix: scope `key` to `req.userTokenData.userId` server-side.
- **LOW.** `backend/src/app.ts:167-177` add `if(res.headersSent)return;`; `extract.ts:228` `/stems/manifest` requireAuth; `stems.ts:6,15` requireAuth; `storage.ts:68-97` scope mock keys to userId; `middleware/presence.ts`+`collab.ts` SSE userId from verified token not query; `tierGuard.requireFeature` call requireAuth defensively; `lib/supabase.ts`/`sqlite.ts` remove comments.

### LIB/MISC (HIGH + MED + LOW)
- **H6.** `src/lib/keyboard.ts:17,67,72` — `key` lowercased so `"Delete"/"Backspace"/"Escape"` never match. Fix: compare lowercased literals (`"delete"`,`"backspace"`,`"escape"`); remove dead uppercase checks (52,57).
- **H7.** `src/lib/projectTemplates.ts:442-447` — duplicate plugin IDs across tracks (`plugin-${now}-${i}`). Fix: include track index `plugin-${now}-${trackIdx}-${i}`.
- **M28.** `src/lib/openbandFormat.ts:172-176` — CRC32 mismatch only logs, proceeds. Fix: throw/skip corrupt entry.
- **M29.** `src/lib/projectEncryption.ts:62` — `btoa(...spread)` overflow. Fix: chunked build.
- **M30.** `src/lib/openbandFormat.ts:262-303` — save/load silently fails on desktop (raw window APIs). Fix: route through `OpenBandNative` from `@bridge` (or guard gracefully).
- **M31.** `src/lib/openbandFormat.ts:270` — `new Blob([archiveData.buffer as ArrayBuffer])` → pass `archiveData` directly.
- **M32.** `src/lib/i18n.ts:33` — fallback `'pt-BR'` inconsistent with `fallbackLng:'en'`. Fix: default `"en"`.
- **LOW.** `src/lib/automix.ts:247` dup `keys` in regex; `hardwareIO.ts:316,338` dynamic require → static import; `creativeModes.ts:144` `as any` → type route; `feedApi.ts:29` `Promise<any>` → narrow; `feedApi.ts:66-74` favorite fallback masquerades count; `projectTemplates.ts:415` hardcoded "pop" fallback. Remove comments in touched files.

### SPEC HYGIENE (separate subagent — openspec only)
- **S1.** Archive the 15 leftover dirs in `openspec/changes/` (move to `openspec/archive/`), adding a `## Status: SHIPPED` marker to each proposal.
- **S2.** Reconcile contradictory status markers in the 6 session specs (`code-review-hardening`, `code-review-low-cleanup`, `audio-recording-fixes`, `env-build-and-types-fixes`, `tsc-error-cleanup`, `vitest-failure-cleanup`, `docs-agents-update`): pick convention `## Status: SHIPPED` and apply uniformly across proposal/design/tasks.
- **S3.** Add a correction note to `env-build-and-types-fixes` proposal/design stating `src/react-native.d.ts` was actually harmful (shadowed real types) and was deleted; the durable fix is `src/declarations.d.ts`.
- **S4.** Standardize a `## Status: SHIPPED` marker across all archived proposals for consistency (add to any archive missing one).

## Objectives

1. Eliminate crash-class defects (H1, H2, H3, H6, H7) that leak resources or lose
   collaboration data.
2. Fix Wasm host/instrument correctness (M1–M4), offline decode (M5), and
   time-stretch (M7) so they do not corrupt audio or overflow stacks.
3. Close UI/3D leaks (H5, M6, M15), fix aiAutoMix math (M13, M14), wire missing
   CommandPalette keyboard nav + shared TextInput (M16, M17), add waveform resize
   redraw (M18), and remove dead code (M19–M23).
4. Harden backend auth + storage (M24–M27) to prevent disk-fill, file leaks, and
   IDOR downloads.
5. Fix LIB/MISC correctness (H6, H7, M28–M32) including the keyboard lowercasing
   bug and duplicate plugin IDs.
6. Apply scoped LOW cleanups (empty catches → bind+log, dead code, comment removal
   only in touched files) without wholesale comment purges.

## Non-Goals

- New features or refactors beyond the minimal fix for each finding.
- Wholesale comment removal outside the files explicitly touched by a finding.
- SPEC HYGIENE source edits — S1–S4 are spec-only and handled by a separate
  subagent; this change must NOT mark those SHIPPED.
- Rewriting the CRDT into a production consensus protocol — only the minimal
  loop/compaction and replay-dedup fixes required.

## Approach Summary

Group fixes by the five code domains plus the spec-hygiene track. Each fix is
localized to the file/function cited above, follows existing patterns, introduces
no new dependencies, and passes the full verification matrix without regressions.
MED fixes that are behavior-changing (M13 precedence, M14 NaN, M20 fader caps,
M26/M27 IDOR scoping) must keep existing tests green.

## Risks

- H3 loop rewrite and `operationsRef` compaction must not change CRDT convergence
  semantics; verify against existing collaboration/crdt tests.
- H4 unsubscribe-fn change touches `useCloudSync`/`useAutoPush` callers — ensure no
  leaked subscriber.
- M26/M27 ownership scoping must keep legitimate owner downloads working; verify
  backend tests with a valid `userTokenData`.
- M18 ResizeObserver must be removed in cleanup to avoid leaks.
- M30/M31 desktop path must not introduce a new OB-GRAPH-001 (frontend must route
  through `OpenBandNative` from `@bridge`).
- SPEC edits (S1–S4) are markdown-only and must not alter code.

## Verification Matrix (full — run after implementation)

- `npx tsc --noEmit` → 0 errors
- `cd backend && npx tsc --noEmit` → 0 errors
- `npx vitest run` → all pass (no regression)
- `npm run test:legacy` → pass
- `npm run graph:ci` → CI PASS
- `npm run build` → pass
- No new OB-GRAPH-001 (frontend must use `@bridge`)
