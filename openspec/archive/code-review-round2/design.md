# Design: code-review-round2 — Fix HIGH + MED + LOW Findings (Second Full-Repo Review)

> **Status: PROPOSED.** No source edits yet. Behavior-changing MED fixes are
> flagged with **(behavior-changing)** so the implementer keeps tests green.

## AUDIO (HIGH + MED + LOW)

### H1 — per-chunk OfflineAudioContext close (`src/lib/chunkedRenderer.ts:191`)
**Current:**
```ts
const ctx = new OfflineAudioContext(2, len, sampleRate);
const buffer = await ctx.startRendering();
// ctx never closed
```
**New:**
```ts
const ctx = new OfflineAudioContext(2, len, sampleRate);
const buffer = await ctx.startRendering();
ctx.close().catch((e) => console.warn("[chunkedRenderer] close failed", e));
```
**Classification: live resource leak.**

### M1 — btoa stack overflow (`src/lib/wasmPluginHost.ts:283`)
**Current:** `btoa(String.fromCharCode(...bytes))` — spread of large arrays overflows call stack.
**New:** build binary string in chunks of ~0x8000:
```ts
let bin = "";
const CHUNK = 0x8000;
for (let i = 0; i < bytes.length; i += CHUNK) {
  bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
}
return btoa(bin);
```
**Classification: live crash (large wasm).**

### M2 — stale `_heapF32` after `memory.grow` (`src/lib/wasmPluginHost.ts:105/127`)
**Current:** `_heapF32` is cached once; `memory.grow` reallocates the buffer → stale view.
**New:** at the start of `process()`, re-read `const mem = exports.memory; const heap = new Float32Array(mem.buffer);` (and Int32/Uint8 equivalents) before reading/writing.
**Classification: live correctness bug.**

### M3 — hardcoded sampleRate (`src/lib/wasmInstrumentEngine.ts:120`)
**Current:** `const sampleRate = 44100;`
**New:** add `let engineSampleRate = 44100; export function setSampleRate(n){ engineSampleRate = n; }` called from the renderer; use `engineSampleRate` for phase increments and envelope timing.
**Classification: live correctness bug.**

### M4 — envelope resets each render block (`src/lib/wasmInstrumentEngine.ts`)
**Current:** envelope state is reinitialized at the top of every `render()` block → clicks / retrigger.
**New:** track a running render clock (`renderStart`) and set `startTime` at note-on to engine time; advance envelope by elapsed samples rather than per-block reset.
**Classification: live audio-quality bug.**

### M5 — offline decode uses realtime ctx (`src/lib/universalAudio.ts:321`)
**Current:** `await new AudioContext().decodeAudioData(...)` for offline mixdown decode.
**New:** decode on the `OfflineAudioContext` used for the mixdown (or a dedicated OAC) so timing/sampleRate align and the realtime ctx is not spun up.
**Classification: live correctness/perf bug.**

### M6 — re-entrant startDirectMonitor leak (`src/lib/latencyMonitor.ts:75-116`)
**Current:** `startDirectMonitor` opens a mic `getUserMedia` stream without guarding re-entry → multiple streams.
**New:**
```ts
async function startDirectMonitor() {
  if (monitorState.enabled) return;            // guard re-entry
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  monitorState = { enabled: true, stream };
  // ...
}
```
(or stop the previous stream before opening a new one). Add `stopDirectMonitor()` that `track.stop()`s + clears `monitorState`.
**Classification: live resource leak.**

### M7 — pitch-shift half-implemented (`src/lib/timeStretchVocoded.ts:233-234`)
**Current:** pitch ratio applied to analysis hop only; `synthesisHop` not rescaled → timbre smear.
**New:** fold pitch into `synthesisHop = analysisHop * pitchRatio;` (or document the limitation explicitly in a code comment-free way, e.g. a thrown/dev warning if pitch != 1). **Classification: live correctness bug (or documented limitation).**

### LOW — empty catches + telemetry + lfo timing + comments
- `src/lib/universalAudio.ts` (~32,51,60,773,777): `catch(e){ console.warn(...) }`.
- `src/lib/previewEngine.ts:55`: capture `e`, warn.
- `src/lib/subtractiveSynth.ts` (catches 91-93,213-215,235-237,260-262): capture `e`; on `dispose()` call `trackGain.disconnect()` / `osc.disconnect()`.
- `src/lib/modulationMatrix.ts:376,382`: capture `e`, warn.
- `src/lib/midiScheduler.ts:98,105`: capture `e`; remove dead `alreadyScheduled` branch.
- `src/lib/audioTelemetry.ts:130`: replace hardcoded `44100` with the context `sampleRate`.
- `src/lib/modulationMatrix.ts:428`: `lfoTime += dt;` where `dt` is real elapsed seconds (from performance.now diff), not `1/60`.
- `src/lib/canvasWaveform.ts`: capture `e` in catches; remove comments.
- Remove comments in every audio file touched above.
**Classification: LOW convention + metric bug.**

## STATE (HIGH + MED + LOW)

### H2 — IDB ops deleted before flush (`src/lib/collaboration.ts:118-122,160`)
**Current:**
```ts
const ops = await getAll(STORE);
await clear(STORE);                 // delete before fetch
const res = await fetch(...);       // if this throws, ops are gone
```
**New:** POST first, then delete each entry by id only after its POST resolves:
```ts
for (const op of ops) {
  try { await fetch(url, { body: JSON.stringify(op) }); await deleteOp(op.id); }
  catch (e) { console.warn("flush failed, keeping op", op.id, e); /* keep for retry */ }
}
```
**Classification: live data-loss bug.**

### H3 — spread stack overflow + operationsRef compaction (`src/lib/crdt.ts:104` + `collaboration.ts:145`)
**Current:** `Math.max(localClock, ...merged.map(o => o.lamport))` — unbounded spread → RangeError.
**New:** replace with a bounded loop:
```ts
let max = localClock;
for (const o of merged) if (o.lamport > max) max = o.lamport;
localClock = max + 1;
```
And on merge call `compactOperations()` to cap `operationsRef` (e.g. keep last N or dedupe by id).
**Classification: live crash + memory growth.**

### H4 — subscriber wipe (`src/lib/projectStore.ts:58-66`)
**Current:** `setOnProjectSaved(null)` clears the entire `listeners` array → all subscribers dropped.
**New:** `setOnProjectSaved(cb)` returns an unsubscribe fn `() => listeners.delete(cb)`; update `useCloudSync` and `useAutoPush` to call it in cleanup. Remove the clears-all branch.
**Classification: live bug (lost persistence subscribers).**

### M8 — bus ops dropped on replay (`src/lib/snapshotManager.ts:149-184`)
**Current:** `applyOperation` switch handles track/track.* but not `bus.add`/`bus.remove`/`bus.update`.
**New:** add `bus.add`/`bus.remove`/`bus.update` cases (or delegate to `crdt.applyOperation`) so bus edits survive snapshot replay.
**Classification: live data-loss on replay.**

### M9 — branching accept-filter + double-application (`src/lib/projectBranching.ts:240-258,286-336`)
**Current:** accept-filter only filters `add` ops; then both the diff and `crdtOperations` are merged → double-application.
**New:** filter `update`/`remove` ops by accepted ids too; drive merge from a single source (apply the filtered diff once).
**Classification: live correctness bug.**

### M10 — replay onto edited state (`src/lib/collaboration.ts:347-356`)
**Current:** `applyToState` replays incoming ops onto the current (already-edited) state.
**New:** pass a clean base snapshot, or dedupe incoming ops against a `op.id` watermark before applying.
**Classification: live correctness bug.**

### M11 — command key collision (`src/lib/commandRegistry.ts:318-338`)
**Current:** Space bound to both play and stop; undo/redo bindings crossed.
**New:** distinct keys (e.g. Space → play, Shift+Space → stop; Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z redo) — verify no overlap.
**Classification: live UX bug (behavior-changing).**

### M12 — objectStorage empty catch (`src/lib/objectStorage.ts:78-89`)
**New:** `catch(e){ console.warn("[objectStorage] put failed", e); }`.
**Classification: LOW.**

### LOW — busRouter/history/caps/comments
- `src/lib/busRouter.ts:90-109`: on track removal, `trackGain.disconnect()`.
- `src/lib/stateAssetSeparation.ts:247`: cap history length.
- `src/lib/cloudSync.ts`/`objectStorage.ts`: bound unbounded Maps (TTL/cap).
- `src/lib/crashRecovery.ts`/`cloudSync.ts`: empty catches → `catch(e){console.warn(...) }`.
- `src/lib/commandRegistry.ts:34`: delete dead `activeBinding`.
- `src/lib/history.ts`: wrap memoized callbacks in `useCallback`.
- Remove comments in touched files.
**Classification: LOW.**

## UI/3D (HIGH + MED + LOW)

### H5 — leaked window/touch listeners (`app/spatial-audio.tsx:240,250`)
**Current:**
```ts
window.addEventListener("mousemove", onMove);
window.addEventListener("mouseup", onUp);
// no removal
```
**New:** name the handlers; in cleanup `window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp);` and mirror for touch equivalents.
**Classification: live resource leak.**

### M13 — aiAutoMix precedence bug (`src/lib/aiAutoMixAnalysis.ts:48`) **(behavior-changing)**
**Current:** `lower.includes("drum") && lower.includes("low") || lower.includes("kick")` — wrong precedence.
**New:** `(lower.includes("drum") && lower.includes("low")) || lower.includes("kick")`.
**Classification: live mis-classification.**

### M14 — empty analyses NaN (`src/lib/aiAutoMixAnalysis.ts:342-343`) **(behavior-changing)**
**Current:** `analyses.reduce(...)/analyses.length` with `analyses=[]` → NaN/−Infinity.
**New:** early-return a safe default (e.g. `{ score: 0, ... }`) when `analyses.length === 0`.
**Classification: live NaN bug.**

### M15 — empty catches (`app/_layout.tsx:89`, `app/studio/[id].tsx:395`, `GenerateCoverModal.tsx:82`)
**New:** `catch(e){ console.warn(...); }`.
**Classification: LOW.**

### M16 — CommandPalette keyboard nav (`src/components/CommandPalette.tsx`)
**Current:** ↑↓/Enter/Esc not handled.
**New:** add `onKeyDown` on the `TextInput` updating active index (↑/↓), executing on Enter, closing on Esc.
**Classification: live missing feature.**

### M17 — shared TextInput (`MixManager.tsx:87`, `CommandPalette.tsx:70`)
**Current:** hand-rolled `<TextInput>`-like views.
**New:** import and use the shared `TextInput` from `src/components/`.
**Classification: live consistency/bug.**

### M18 — waveform resize redraw (`src/components/WaveformCanvas.tsx:96-110`)
**Current:** waveform drawn once; no redraw on container resize.
**New:** debounced `ResizeObserver` that re-draws; `observer.disconnect()` in cleanup.
**Classification: live visual bug.**

### M19 — emissive no-op (`app/virtual-studio.tsx:275`)
**Current:** `material.emissive.set(...)` on `MeshToonMaterial` (no `emissive` support).
**New:** use `MeshStandardMaterial` (supports `emissive`) or drive `material.color`.
**Classification: live no-op.**

### M20 — fader cap drift (`app/mixing-console.tsx:622`) **(behavior-changing)**
**Current:** `capY += bob;` accumulates drift.
**New:** `capY = baseY + bob;` (absolute).
**Classification: live visual drift.**

### M21 — dead scene.traverse (`app/dj-stage.tsx:279-283`)
**New:** delete the dead block.
**Classification: LOW dead code.**

### M22 — dead isSpeedDial branch (`app/cover-jam.tsx:196-204`)
**New:** collapse to `intersectObject(speedDial, true)`.
**Classification: LOW dead code.**

### M23 — unused dotMat in 12 tool rooms
**Current:** `const { stripMat, dotMat } = addRGBStrip(...)` where `dotMat` unused.
**New:** `const { stripMat } = addRGBStrip(...)` at dj-stage:69, autotune:65, cover-jam:80, lofi-tape:69, live-room:69, synth-lab:273, stem-collider:84, acoustics:73.
**Classification: LOW dead code.**

### LOW — small cleanups + comments
- `src/lib/responsive.ts:20,32` comments removed.
- `app/studio/[id].tsx:2117` remove dead `+recordingTick*0`; `:1957` comment removed.
- `app/vocal-booth.tsx:330-331` redundant phi clamp removed.
- `app/virtual-studio.tsx:74` `lightRef` → `useRef` (stable across renders).
- `spatial-audio.tsx:289`/`lofi-tape.tsx:509` remove unused `lastTime`.
- `stem-collider.tsx:162` remove unused var.
- `Sidebar.tsx:143` simplify branch.
- `CommandPalette.tsx:21` remove unused `inputRef`.
- `GenerateCoverModal.tsx:60,69` dedupe base64 helpers.
- `beatmaker.tsx:334-335` leave `geometry.parameters.height` if correct.
- Remove comments in touched files.
**Classification: LOW.**

## BACKEND (HIGH + MED + LOW)

### M24 — orphan mock WAVs (`extract.ts:146` + `queue.ts:135`)
**Current:** `queue.addJob` enqueues a mock job that writes `mock_*.wav` and is never consumed → disk-fill.
**New:** remove the stray `addJob` call in the extract route, or make it the real producer that returns `jobId` so the consumer path reclaims it.
**Classification: live disk-fill.**

### M25 — uploaded file leak on DEMUCS_NOT_FOUND (`extract.ts:183-188`)
**Current:** inner catch returns 500 without removing `req.file.path`.
**New:** `cleanup(req.file?.path)` (best-effort `fs.unlink`) before responding 500.
**Classification: live file leak.**

### M26 — download IDOR (`extract.ts:206`, `master.ts:172`)
**Current:** `GET /api/stems/:filename` / `/api/master/download/:filename` serve any filename regardless of owner.
**New:** scope the resolved path to `req.userTokenData.userId` (verify the file belongs to the caller) before streaming.
**Classification: live security (IDOR).**

### M27 — presign/head IDOR (`storage.ts:30-47,49-66`)
**Current:** signs any `key` from the query → cross-user object access.
**New:** prefix/scope `key` server-side to `req.userTokenData.userId`; reject keys that escape the user prefix.
**Classification: live security (IDOR).**

### LOW — guards/auth/comments
- `backend/src/app.ts:167-177`: `if (res.headersSent) return;` before writing error.
- `extract.ts:228` `/stems/manifest` → `requireAuth`.
- `stems.ts:6,15` → `requireAuth`.
- `storage.ts:68-97` scope mock keys to userId.
- `middleware/presence.ts` + `collab.ts`: derive SSE userId from the verified token (not query string).
- `tierGuard.requireFeature`: call `requireAuth` defensively.
- `lib/supabase.ts`/`sqlite.ts`: remove comments.
**Classification: LOW.**

## LIB/MISC (HIGH + MED + LOW)

### H6 — keyboard lowercasing (`src/lib/keyboard.ts:17,67,72`)
**Current:** `const key = e.key.toLowerCase();` then compares `"Delete"==="delete"` (never true); dead uppercase checks at 52,57.
**New:** compare against lowercased literals (`"delete"`,`"backspace"`,`"escape"`); remove the dead uppercase branches.
**Classification: live bug (Delete/Backspace/Escape never matched).**

### H7 — duplicate plugin IDs (`src/lib/projectTemplates.ts:442-447`)
**Current:** `plugin-${now}-${i}` collides across tracks when `now` is identical.
**New:** `plugin-${now}-${trackIdx}-${i}` to include the track index.
**Classification: live data-integrity bug.**

### M28 — CRC32 mismatch proceeds (`openbandFormat.ts:172-176`)
**Current:** on CRC mismatch it only `console.warn` and continues → corrupt entry loaded.
**New:** `throw new Error("CRC32 mismatch")` or `continue`/skip the corrupt entry.
**Classification: live data-integrity bug.**

### M29 — btoa spread overflow (`projectEncryption.ts:62`)
**New:** chunked binary-string build (same pattern as M1).
**Classification: live crash.**

### M30 — desktop raw window APIs (`openbandFormat.ts:262-303`)
**Current:** uses `window.showSaveFilePicker` / `fetch` directly; silently fails on desktop.
**New:** route through `OpenBandNative` from `@bridge` (save/open dialogs + write/read) or guard gracefully; must not introduce OB-GRAPH-001.
**Classification: live desktop bug (no new bridge boundary violation).**

### M31 — Blob wrap (`openbandFormat.ts:270`)
**Current:** `new Blob([archiveData.buffer as ArrayBuffer])` — double-wraps.
**New:** `new Blob([archiveData])` directly.
**Classification: live bug.**

### M32 — i18n fallback (`src/lib/i18n.ts:33`)
**Current:** `fallbackLng: 'en'` but default lang literal `'pt-BR'`.
**New:** default `"en"`.
**Classification: live i18n bug.**

### LOW — misc cleanups
- `src/lib/automix.ts:247` dedupe `keys` in regex.
- `src/lib/hardwareIO.ts:316,338` dynamic `require` → static import.
- `src/lib/creativeModes.ts:144` `as any` → typed route.
- `src/lib/feedApi.ts:29` `Promise<any>` → narrowed return type.
- `src/lib/feedApi.ts:66-74` favorite fallback no longer masquerades as real count.
- `src/lib/projectTemplates.ts:415` hardcoded "pop" fallback → sensible default or param.
- Remove comments in touched files.
**Classification: LOW.**

## SPEC HYGIENE (separe subagent — openspec only, not SHIPPED here)
- **S1.** Move the 15 leftover `openspec/changes/*` dirs to `openspec/archive/*`, adding `## Status: SHIPPED` to each proposal.
- **S2.** Across the 6–7 session specs, standardize `## Status: SHIPPED` on proposal/design/tasks.
- **S3.** Add correction note to `env-build-and-types-fixes` (react-native.d.ts harmful, deleted; durable fix `src/declarations.d.ts`).
- **S4.** Add `## Status: SHIPPED` to any archived proposal missing one.
These are markdown-only; no source edits.

## File-Change Table (grouped by domain)

| Domain | File | Change | Live / Dead |
| --- | --- | --- | --- |
| AUDIO | `src/lib/chunkedRenderer.ts` | close OAC after render | Live |
| AUDIO | `src/lib/wasmPluginHost.ts` | chunked btoa + re-read memory | Live |
| AUDIO | `src/lib/wasmInstrumentEngine.ts` | setSampleRate + env render clock | Live |
| AUDIO | `src/lib/universalAudio.ts` | decode on OAC + catch e | Live |
| AUDIO | `src/lib/latencyMonitor.ts` | re-entrant guard / stop prev | Live |
| AUDIO | `src/lib/timeStretchVocoded.ts` | fold pitch into synthHop | Live |
| AUDIO | `src/lib/previewEngine.ts` | catch e + dispose | Live |
| AUDIO | `src/lib/subtractiveSynth.ts` | catch e + disconnect on dispose | Live |
| AUDIO | `src/lib/modulationMatrix.ts` | catch e + real lfo dt | Live |
| AUDIO | `src/lib/midiScheduler.ts` | catch e + remove dead var | Live |
| AUDIO | `src/lib/audioTelemetry.ts` | real sampleRate + catch e | Live |
| AUDIO | `src/lib/canvasWaveform.ts` | catch e + remove comments | Live |
| STATE | `src/lib/collaboration.ts` | delete-after-POST + dedupe replay | Live |
| STATE | `src/lib/crdt.ts` | bounded max loop + compact | Live |
| STATE | `src/lib/projectStore.ts` | unsubscribe fn | Live |
| STATE | `src/lib/snapshotManager.ts` | bus.* replay cases | Live |
| STATE | `src/lib/projectBranching.ts` | filter update/remove + single merge | Live |
| STATE | `src/lib/commandRegistry.ts` | distinct keys + remove dead | Live |
| STATE | `src/lib/objectStorage.ts` | catch e | Live |
| STATE | `src/lib/busRouter.ts` | disconnect on remove | Live |
| STATE | `src/lib/stateAssetSeparation.ts` | history cap | Live |
| STATE | `src/lib/cloudSync.ts` | bound map + catch e | Live |
| STATE | `src/lib/crashRecovery.ts` | catch e | Live |
| STATE | `src/lib/history.ts` | useCallback | Live |
| UI-3D | `app/spatial-audio.tsx` | remove window/touch listeners | Live |
| UI-3D | `src/lib/aiAutoMixAnalysis.ts` | precedence + empty-array guard | Live (behavior-changing) |
| UI-3D | `app/_layout.tsx` `studio/[id].tsx` `GenerateCoverModal.tsx` | catch e | Live |
| UI-3D | `src/components/CommandPalette.tsx` | keyboard nav + shared TextInput | Live |
| UI-3D | `src/components/MixManager.tsx` | shared TextInput | Live |
| UI-3D | `src/components/WaveformCanvas.tsx` | ResizeObserver redraw | Live |
| UI-3D | `app/virtual-studio.tsx` | emissive/useRef | Live |
| UI-3D | `app/mixing-console.tsx` | absolute capY | Live (behavior-changing) |
| UI-3D | `app/dj-stage.tsx` `cover-jam.tsx` + 12 rooms | dead code removal | Live |
| UI-3D | `src/lib/responsive.ts` etc. | LOW cleanups + comments | Live |
| BACKEND | `backend/src/routes/extract.ts` | mock-job / file leak / IDOR / auth | Live |
| BACKEND | `backend/src/services/queue.ts` | real producer | Live |
| BACKEND | `backend/src/routes/master.ts` | IDOR scope | Live |
| BACKEND | `backend/src/routes/storage.ts` | IDOR scope + mock keys | Live |
| BACKEND | `backend/src/app.ts` `stems.ts` `middleware/*` | headersSent + auth | Live |
| LIB | `src/lib/keyboard.ts` | lowercased literals | Live |
| LIB | `src/lib/projectTemplates.ts` | trackIdx in plugin id | Live |
| LIB | `src/lib/openbandFormat.ts` | CRC32 throw + Blob + @bridge | Live |
| LIB | `src/lib/projectEncryption.ts` | chunked btoa | Live |
| LIB | `src/lib/i18n.ts` | default "en" | Live |
| LIB | misc | LOW cleanups + comments | Live |

## Verification (full matrix — run after implementation)
1. `npx tsc --noEmit` → 0 errors.
2. `cd backend && npx tsc --noEmit` → 0 errors.
3. `npx vitest run` → all pass (no regression; behavior-changing MED fixes keep suites green).
4. `npm run test:legacy` → pass.
5. `npm run graph:ci` → CI PASS.
6. `npm run build` → pass.
7. No new OB-GRAPH-001 (frontend must use `@bridge`).
