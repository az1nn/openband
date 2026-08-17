# Tasks: code-review-hardening — Fix HIGH + MED Repo-Wide Findings

> **Status: PROPOSED.** All items pending. Writing task only — no source edits,
> no test runs.

## AUDIO ENGINE & DSP

### H1 — Worklet module registration (dead-code-correctness)
- [ ] `src/lib/wasmPluginHost.ts:224` — `await ctx.audioWorklet.addModule(url)` before `new AudioWorkletNode`; revoke `url` after addModule resolves.
- [ ] `src/lib/wasmInstrumentEngine.ts:370` — apply same addModule-then-revoke fix.
- [ ] `src/lib/timeStretchVocoded.ts:437` — apply same addModule-then-revoke fix.

### H2 — Native MIDI render bpm
- [ ] `src/lib/midiSynth.ts:251` — add `bpm` param; `beatDuration = 60 / bpm`.
- [ ] `src/lib/midiSynth.ts:1014` — pass project `bpm` into `renderMidiNotesNative`.

### M1 — Worker blob URL revoke
- [ ] `src/lib/clockManager.ts:59` — revoke worker blob URL only in `onerror`/terminate or after load ack.

### M2 — OfflineAudioContext.close() after startRendering
- [ ] `src/lib/mastering.ts` — append `ctx.close().catch(()=>{})` after each `apply*` render.
- [ ] `src/lib/pluginChain.ts` — `applySinglePlugin` / `applyAutoPitch` close OAC.
- [ ] `src/lib/midiSynth.ts` — `renderTracksToUrl` / `renderTrackStem` / `renderTrackBuffer` close OAC.
- [ ] `src/lib/previewEngine.ts:~229` — `generateThumbnail` close OAC.

### M3 — duration guard
- [ ] `src/lib/universalAudio.ts:~443` — early-return on `duration <= 0` (mirror `~369` web guard).

### M4 — throwaway OAC for createBuffer
- [ ] `src/lib/chunkedRenderer.ts:~274` — use shared `AudioContext`/helper to `createBuffer`.
- [ ] `src/lib/transientDetection.ts:~85` — use shared `AudioContext`/helper to `createBuffer`.

### M5 — peakCpu vs true peak
- [ ] `src/lib/audioTelemetry.ts:~85` — add separate `peakCpuTrue` tracked across the window.

## STATE & COLLABORATION

### H3 — CRDT commutative add
- [ ] `src/lib/crdt.ts:~97-99` — treat `*.add` as set-inserts keyed by `value.id`; dedupe/merge in `mergeOperations`.

### H4 — Lamport clock
- [ ] `src/lib/crdt.ts:34,68-69` — adopt hybrid logical clock `(lamport, clientId)`.
- [ ] `src/lib/crdt.ts:42,73` — order by `(lamport, clientId)` tie-break; bump op schema version.

### H5 — mergeBranch discarded rejects
- [ ] `src/lib/projectBranching.ts:283` — build merged state (applying rejects) then assign `main.state` once.

### H6 — unbounded pendingBridgeSaves
- [ ] `src/lib/projectStore.ts:46,60,87` — skip bridge queue when `checkBridge()` cached false / evict after one failed attempt; bound the map.

### M6 — EventSource / timer leak
- [ ] `src/lib/presence.ts` — add `connectingRef` guard; clear previous timer; close prior `EventSource`.
- [ ] `src/lib/collaboration.ts` — add `connectingRef` guard; clear previous timer; close prior `EventSource`.

### M7 — syncProject divergent remote
- [ ] `src/lib/supabaseRemote.ts:~219` — implement pull-remote-then-rebase (or 3-way merge) instead of setting `conflicts=1` and no-op.

### M8 — single-callback listeners
- [ ] `src/lib/projectStore.ts:56` — `setOnProjectSaved` use a `Set` of listeners.
- [ ] `src/lib/commandRegistry.ts` — `onRegistryStateChange` use a `Set` of listeners.

### M9 — empty catch without `e`
- [ ] `src/lib/crdt.ts:153` — capture `e`, `console.warn`.
- [ ] `src/lib/collaboration.ts:~47,75,123,321` — capture `e`, `console.warn`.
- [ ] `src/lib/presence.ts:~55,65,192` — capture `e`, `console.warn`.
- [ ] `src/lib/projectStore.ts:~376,396` — capture `e`, `console.warn`.
- [ ] `src/lib/busRouter.ts:~92,93,96,99` — capture `e`, `console.warn`.

## UI / 3D

### H7 — 3D effect cleanup
- [ ] `app/virtual-studio.tsx:337` — `return () => { cancelled = true; cleanup?.(); };`; `init().then(fn => disposed ? fn() : (cleanup = fn))`.
- [ ] `app/dj-stage.tsx:318` — same fix.
- [ ] `app/autotune.tsx:~332` — same fix.
- [ ] `app/mixing-console.tsx:~673` — same fix.
- [ ] `app/vocal-booth.tsx` — same fix.
- [ ] `app/beatmaker.tsx` — same fix.
- [ ] `app/lofi-tape.tsx` — same fix.
- [ ] `app/cover-jam.tsx` — same fix.
- [ ] `app/synth-lab.tsx` — same fix.
- [ ] `app/stem-collider.tsx` — same fix.
- [ ] `app/live-room.tsx` — same fix.
- [ ] `app/spatial-audio.tsx` — same fix.
- [ ] `app/acoustics.tsx` — same fix.

### H8 — resize listener leak
- [ ] `app/mixing-console.tsx:~654` — add `window.removeEventListener("resize", handleResize)` in cleanup.

### H9/H10 — window.electronAPI bypass
- [ ] `src/components/GenerateCoverModal.tsx:269` — use `OpenBandNative`/`Platform.OS` capability check instead of `window.electronAPI`.

### M10 — scene disposal
- [ ] `src/lib/sceneLighting.ts` — expose disposers from `addSceneBulb`/`addRGBStrip`; dispose geometry/material/`CanvasTexture`, then `renderer.forceContextLoss()`.
- [ ] 3D scenes — traverse + dispose on unmount.

### M11 — 0-channel buffer guard
- [ ] `src/lib/aiAutoMixAnalysis.ts:~73` — early-return safe default when `numberOfChannels === 0`.

## BACKEND

### H10 — bridge boundary (see H9 above; counted once).

### M12 — GENRE_PATTERNS.pop / DRUM_PATTERNS.pop
- [ ] `backend/src/routes/generator.ts:75-76` — default to `GENRE_PATTERNS["pop"]` / `DRUM_PATTERNS["pop"]`.
- [ ] `backend/src/routes/generator.ts:82` — `DRUM_PATTERNS.pop` → `DRUM_PATTERNS["pop"]`.

### M13 — requireAuth on SSE/downloads
- [ ] `backend/src/routes/collab.ts` — apply `requireAuth`.
- [ ] `backend/src/routes/presence.ts` — apply `requireAuth`.
- [ ] `backend/src/routes/extract.ts:~196` — `/api/stems/:filename` apply `requireAuth`/token.
- [ ] `backend/src/routes/master.ts:~167` — `/api/master/download/:filename` apply `requireAuth`/token.

### M14 — queue artifact/prune
- [ ] `backend/src/services/queue.ts:~54` — delete `mock_*.wav` artifacts; prune completed jobs from `jobs` Map.

### M15 — fd leak + swallowed error
- [ ] `backend/src/routes/extract.ts:~33` — `try/finally` to guarantee `fd.close()`.
- [ ] `backend/src/routes/extract.ts:~78` — replace `catch { return 0; }` with `catch (e) { logger.error(e); return 0; }`.

### M16 — generator try/catch
- [ ] `backend/src/routes/generator.ts:~64` — wrap handler in `try/catch`; generic 500, no stack trace.

## Verification (full matrix — run after implementation)
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `cd backend && npx tsc --noEmit` → 0 errors.
- [ ] `npx vitest run` → all pass.
- [ ] `npm run test:legacy` → pass.
- [ ] `npm run graph:ci` → CI PASS.
- [ ] `npm run build` → pass.
