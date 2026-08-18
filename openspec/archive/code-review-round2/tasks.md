# Tasks: code-review-round2 — Fix HIGH + MED + LOW Findings (Second Full-Repo Review)

> **Status: PROPOSED.** All items pending. Writing task only — no source edits,
> no test runs. Behavior-changing MED fixes marked **(behavior-changing)** must
> keep existing tests green. SPEC HYGIENE (S1–S4) is handled by a separate
> spec-only subagent and is NOT marked SHIPPED here.

## AUDIO (HIGH + MED + LOW)

### H1 — per-chunk OfflineAudioContext close
- [ ] `src/lib/chunkedRenderer.ts:191` — after `startRendering()` call `ctx.close().catch(e => console.warn(...))`.

### M1 — btoa stack overflow
- [ ] `src/lib/wasmPluginHost.ts:283` — build binary string in chunks (`String.fromCharCode(...subarray)` over 0x8000 blocks) instead of spreading the whole array.

### M2 — stale heap view after memory.grow
- [ ] `src/lib/wasmPluginHost.ts:105,127` — re-read `exports.memory.buffer` and rebuild heap typed-array views at the start of `process()`.

### M3 — hardcoded sampleRate
- [ ] `src/lib/wasmInstrumentEngine.ts:120` — add `setSampleRate(n)`; use engine sample rate for phase/env timing.

### M4 — envelope reset per block
- [ ] `src/lib/wasmInstrumentEngine.ts` — track running render clock; set `startTime` at note-on to engine time; advance envelope by elapsed samples.

### M5 — offline decode uses realtime ctx
- [ ] `src/lib/universalAudio.ts:321` — decode on the OfflineAudioContext used for mixdown.

### M6 — re-entrant monitor leak
- [ ] `src/lib/latencyMonitor.ts:75-116` — guard `startDirectMonitor` with `if (monitorState.enabled) return;` (or stop previous stream first); add `stopDirectMonitor`.

### M7 — pitch-shift half-implemented
- [ ] `src/lib/timeStretchVocoded.ts:233-234` — fold pitch ratio into `synthesisHop` (or document the limitation).

### LOW — empty catches + telemetry + lfo + comments
- [ ] `src/lib/universalAudio.ts` (~32,51,60,773,777) — capture `e`, `console.warn`.
- [ ] `src/lib/previewEngine.ts:55` — capture `e`, warn.
- [ ] `src/lib/subtractiveSynth.ts` (91-93,213-215,235-237,260-262) — capture `e`; `disconnect()` on `dispose`.
- [ ] `src/lib/modulationMatrix.ts:376,382` — capture `e`, warn.
- [ ] `src/lib/midiScheduler.ts:98,105` — capture `e`; remove dead `alreadyScheduled`.
- [ ] `src/lib/audioTelemetry.ts:130` — use real `sampleRate` instead of hardcoded 44100.
- [ ] `src/lib/modulationMatrix.ts:428` — `lfoTime += dt` with real elapsed seconds.
- [ ] `src/lib/canvasWaveform.ts` — capture `e` in catches; remove comments.
- [ ] Remove comments in every audio file touched above.

## STATE (HIGH + MED + LOW)

### H2 — IDB ops deleted before flush
- [ ] `src/lib/collaboration.ts:118-122,160` — POST each op then delete by id only after POST resolves; keep on failure.

### H3 — spread overflow + compaction
- [ ] `src/lib/crdt.ts:104` — replace `Math.max(localClock, ...merged.map(...))` with a bounded loop.
- [ ] `src/lib/collaboration.ts:145` — cap `operationsRef` via `compactOperations` on merge.

### H4 — subscriber wipe
- [ ] `src/lib/projectStore.ts:58-66` — `setOnProjectSaved` returns unsubscribe fn; update `useCloudSync`/`useAutoPush` to use it; remove clears-all branch.

### M8 — bus ops dropped on replay
- [ ] `src/lib/snapshotManager.ts:149-184` — add `bus.add`/`bus.remove`/`bus.update` replay cases (or reuse `crdt.applyOperation`).

### M9 — branching accept-filter + double-application
- [ ] `src/lib/projectBranching.ts:240-258,286-336` — filter update/remove ops by accepted ids; drive merge from a single source.

### M10 — replay onto edited state
- [ ] `src/lib/collaboration.ts:347-356` — pass clean base or dedupe by `op.id` watermark.

### M11 — command key collision
- [ ] `src/lib/commandRegistry.ts:318-338` — distinct keys for play/stop and undo/redo **(behavior-changing)**.

### M12 — objectStorage empty catch
- [ ] `src/lib/objectStorage.ts:78-89` — `catch(e){ console.warn(...) }`.

### LOW — busRouter/history/caps/comments
- [ ] `src/lib/busRouter.ts:90-109` — `trackGain.disconnect()` on track removal.
- [ ] `src/lib/stateAssetSeparation.ts:247` — cap history length.
- [ ] `src/lib/cloudSync.ts` / `objectStorage.ts` — bound unbounded Maps.
- [ ] `src/lib/crashRecovery.ts` / `cloudSync.ts` — empty catches → `catch(e){console.warn(...) }`.
- [ ] `src/lib/commandRegistry.ts:34` — remove dead `activeBinding`.
- [ ] `src/lib/history.ts` — `useCallback` for memoized callbacks.
- [ ] Remove comments in touched files.

## UI/3D (HIGH + MED + LOW)

### H5 — leaked window/touch listeners
- [ ] `app/spatial-audio.tsx:240,250` — named handlers + `removeEventListener` in cleanup (mirror touch handlers).

### M13 — aiAutoMix precedence **(behavior-changing)**
- [ ] `src/lib/aiAutoMixAnalysis.ts:48` — parenthesize `(lower.includes("drum") && lower.includes("low")) || lower.includes("kick")`.

### M14 — empty analyses NaN **(behavior-changing)**
- [ ] `src/lib/aiAutoMixAnalysis.ts:342-343` — early-return safe default when `analyses.length === 0`.

### M15 — empty catches
- [ ] `app/_layout.tsx:89` — capture `e`, warn.
- [ ] `app/studio/[id].tsx:395` — capture `e`, warn.
- [ ] `src/components/GenerateCoverModal.tsx:82` — capture `e`, warn.

### M16 — CommandPalette keyboard nav
- [ ] `src/components/CommandPalette.tsx` — add `onKeyDown` on TextInput (↑↓/Enter/Esc).

### M17 — shared TextInput
- [ ] `src/components/MixManager.tsx:87` — use shared `TextInput`.
- [ ] `src/components/CommandPalette.tsx:70` — use shared `TextInput`.

### M18 — waveform resize redraw
- [ ] `src/components/WaveformCanvas.tsx:96-110` — debounced ResizeObserver re-draw; `disconnect()` in cleanup.

### M19 — emissive no-op
- [ ] `app/virtual-studio.tsx:275` — use `MeshStandardMaterial` (supports emissive) or drive `color`.

### M20 — fader cap drift **(behavior-changing)**
- [ ] `app/mixing-console.tsx:622` — `capY = baseY + bob` (absolute).

### M21 — dead scene.traverse
- [ ] `app/dj-stage.tsx:279-283` — delete dead block.

### M22 — dead isSpeedDial branch
- [ ] `app/cover-jam.tsx:196-204` — collapse to `intersectObject(speedDial, true)`.

### M23 — unused dotMat in 12 tool rooms
- [ ] destructure only `{ stripMat }` at dj-stage:69, autotune:65, cover-jam:80, lofi-tape:69, live-room:69, synth-lab:273, stem-collider:84, acoustics:73.

### LOW — small cleanups + comments
- [ ] `src/lib/responsive.ts:20,32` — remove comments.
- [ ] `app/studio/[id].tsx:2117` — remove dead `+recordingTick*0`.
- [ ] `app/studio/[id].tsx:1957` — remove comment.
- [ ] `app/vocal-booth.tsx:330-331` — remove redundant phi clamp.
- [ ] `app/virtual-studio.tsx:74` — `lightRef` → `useRef`.
- [ ] `spatial-audio.tsx:289` / `lofi-tape.tsx:509` — remove unused `lastTime`.
- [ ] `stem-collider.tsx:162` — remove unused var.
- [ ] `Sidebar.tsx:143` — simplify branch.
- [ ] `CommandPalette.tsx:21` — remove unused `inputRef`.
- [ ] `GenerateCoverModal.tsx:60,69` — dedupe base64 helpers.
- [ ] `beatmaker.tsx:334-335` — leave `geometry.parameters.height` if correct.
- [ ] Remove comments in touched files.

## BACKEND (HIGH + MED + LOW)

### M24 — orphan mock WAVs
- [ ] `backend/src/routes/extract.ts:146` + `backend/src/services/queue.ts:135` — remove stray `addJob` or make it the real producer returning `jobId`.

### M25 — uploaded file leak
- [ ] `backend/src/routes/extract.ts:183-188` — `cleanup(req.file?.path)` before 500 on `DEMUCS_NOT_FOUND`.

### M26 — download IDOR
- [ ] `backend/src/routes/extract.ts:206` — scope filename to `req.userTokenData.userId`.
- [ ] `backend/src/routes/master.ts:172` — scope filename to `req.userTokenData.userId`.

### M27 — presign/head IDOR
- [ ] `backend/src/routes/storage.ts:30-47,49-66` — scope `key` to `req.userTokenData.userId`.

### LOW — guards/auth/comments
- [ ] `backend/src/app.ts:167-177` — `if (res.headersSent) return;`.
- [ ] `backend/src/routes/extract.ts:228` — `/stems/manifest` `requireAuth`.
- [ ] `backend/src/routes/stems.ts:6,15` — `requireAuth`.
- [ ] `backend/src/routes/storage.ts:68-97` — scope mock keys to userId.
- [ ] `backend/src/middleware/presence.ts` + `collab.ts` — SSE userId from verified token, not query.
- [ ] `backend/src/routes/tierGuard.requireFeature` — defensive `requireAuth`.
- [ ] `backend/src/lib/supabase.ts` / `sqlite.ts` — remove comments.

## LIB/MISC (HIGH + MED + LOW)

### H6 — keyboard lowercasing
- [ ] `src/lib/keyboard.ts:17,67,72` — compare lowercased literals (`"delete"`,`"backspace"`,`"escape"`); remove dead uppercase checks (52,57).

### H7 — duplicate plugin IDs
- [ ] `src/lib/projectTemplates.ts:442-447` — `plugin-${now}-${trackIdx}-${i}`.

### M28 — CRC32 mismatch proceeds
- [ ] `src/lib/openbandFormat.ts:172-176` — throw/skip corrupt entry on CRC32 mismatch.

### M29 — btoa spread overflow
- [ ] `src/lib/projectEncryption.ts:62` — chunked binary-string build.

### M30 — desktop raw window APIs
- [ ] `src/lib/openbandFormat.ts:262-303` — route save/load through `OpenBandNative` from `@bridge` (or guard gracefully); no new OB-GRAPH-001.

### M31 — Blob wrap
- [ ] `src/lib/openbandFormat.ts:270` — `new Blob([archiveData])` directly.

### M32 — i18n fallback
- [ ] `src/lib/i18n.ts:33` — default `"en"`.

### LOW — misc cleanups
- [ ] `src/lib/automix.ts:247` — dedupe `keys` in regex.
- [ ] `src/lib/hardwareIO.ts:316,338` — dynamic `require` → static import.
- [ ] `src/lib/creativeModes.ts:144` — `as any` → typed route.
- [ ] `src/lib/feedApi.ts:29` — `Promise<any>` → narrowed return type.
- [ ] `src/lib/feedApi.ts:66-74` — favorite fallback no longer masquerades as count.
- [ ] `src/lib/projectTemplates.ts:415` — replace hardcoded "pop" fallback.
- [ ] Remove comments in touched files.

## SPEC HYGIENE (separate spec-only subagent — not SHIPPED here)
- [ ] S1 — archive 15 leftover `openspec/changes/*` dirs to `openspec/archive/*` with `## Status: SHIPPED`.
- [ ] S2 — standardize `## Status: SHIPPED` across the 6–7 session specs (proposal/design/tasks).
- [ ] S3 — add correction note to `env-build-and-types-fixes` (react-native.d.ts harmful; durable fix `src/declarations.d.ts`).
- [ ] S4 — add `## Status: SHIPPED` to any archived proposal missing one.

## Verification (full matrix — run after implementation)
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `cd backend && npx tsc --noEmit` → 0 errors.
- [ ] `npx vitest run` → all pass.
- [ ] `npm run test:legacy` → pass.
- [ ] `npm run graph:ci` → CI PASS.
- [ ] `npm run build` → pass.
- [ ] No new OB-GRAPH-001 (frontend must use `@bridge`).
