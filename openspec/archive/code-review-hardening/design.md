# Design: code-review-hardening — Fix HIGH + MED Repo-Wide Findings

## Status: SHIPPED
> worklets) are flagged separately from live-bug fixes.

## AUDIO ENGINE & DSP

### H1 — Worklet module registration (dead code, must be correct if wired)
**Current** (`src/lib/wasmPluginHost.ts:224-226`):
```ts
const url = buildPluginUrl(descriptor.id, wasmBytes);
const workletNode = new AudioWorkletNode(ctx, `${descriptor.id}-processor`, { ... });
URL.revokeObjectURL(url); // revoked before module loads → "processor not registered"
```
**New:**
```ts
const url = buildPluginUrl(descriptor.id, wasmBytes);
await ctx.audioWorklet.addModule(url);          // register first
const workletNode = new AudioWorkletNode(...);
URL.revokeObjectURL(url);                        // safe to revoke after addModule resolves
```
Apply the identical pattern in `src/lib/wasmInstrumentEngine.ts:370` and
`src/lib/timeStretchVocoded.ts:437`. **Classification: dead-code-correctness.**

### H2 — Native MIDI render bpm
**Current** (`src/lib/midiSynth.ts:251`): `const beatDuration = 60 / 120;` inside
`renderMidiNotesNative`; caller at `:1014` ignores project `bpm`.
**New:** add `bpm` param; `beatDuration = 60 / bpm`; pass `tracks[0].bpm` (or the
project bpm) from `renderTracksToUrl` native fallback at `:1014`.
**Classification: live bug.**

### M1 — Worker blob URL revoke (`src/lib/clockManager.ts:59`)
**New:** keep `url` alive until the worker signals loaded or errors: revoke in
`worker.onerror` and on `worker.terminate()`; also revoke as a fallback after a
timeout / once `onmessage` load ack arrives.
**Classification: live bug (intermittent).**

### M2 — OfflineAudioContext.close() after startRendering
**New** (every site: `mastering.ts` apply*, `pluginChain.ts`
`applySinglePlugin`/`applyAutoPitch`, `midiSynth.ts` render*, `previewEngine.ts`
`generateThumbnail`):
```ts
const buffer = await ctx.startRendering();
ctx.close().catch(() => {});
return buffer;
```
**Classification: live resource leak.**

### M3 — duration guard (`src/lib/universalAudio.ts:~443`)
**New:** `if (!(duration > 0)) return null;` (mirrors web guard at `~369`).
**Classification: live bug.**

### M4 — throwaway OAC for createBuffer
**New** (`chunkedRenderer.ts:~274`, `transientDetection.ts:~85`): create buffers
via a shared helper `createBufferSafe(ctx, ...)` using a long-lived
`AudioContext` (or a module-level `AudioContext`) instead of spinning up a full
`OfflineAudioContext` just to call `createBuffer`.
**Classification: live resource waste.**

### M5 — peakCpu vs true peak (`src/lib/audioTelemetry.ts:~85`)
**New:** add a separate `peakCpuTrue` field tracked across the window; keep
`peakCpu` as the running max only within the current sampling bucket and report
`peakCpuTrue` as the window peak.
**Classification: live metric bug.**

## STATE & COLLABORATION

### H3 — CRDT commutative add (`src/lib/crdt.ts:~97-99`)
**Current:** `*.add` ops with same key overwrite; one is dropped (lost update).
**New:** treat `*.add` as set-inserts keyed by `value.id`; in `applyOperation`,
if an op with the same `value.id` already exists, merge (keep both / take the
higher lamport). `mergeOperations` dedupes by `value.id` for add types.

### H4 — Lamport clock (`src/lib/crdt.ts:34,42,68-69,73`)
**Current:** `timestamp` = per-client `localClock`; `mergeOperations` sorts by raw
scalar across replicas → divergent merges.
**New:** adopt a hybrid logical clock `(lamport, clientId)`; on merge,
`localClock = max(localClock, incoming.lamport) + 1`; order by
`(a.lamport - b.lamport) || (a.clientId < b.clientId ? -1 : 1)`. Bump op schema
version.

### H5 — mergeBranch discarded rejects (`src/lib/projectBranching.ts:283`)
**Current:** `main.state = JSON.parse(JSON.stringify(branch.state));` overwrites.
**New:** build `merged = mergeStates(main.state, branch.state, rejects)` applying
the reject set first, then assign `main.state = merged` once.

### H6 — unbounded pendingBridgeSaves (`src/lib/projectStore.ts:46,60,87`)
**New:** in `saveProjectWeb`, if `checkBridge()` cached `false`, skip queueing
(or evict after one failed attempt); guard the `pendingBridgeSaves` map size and
`checkBridge()` must not permanently cache `false` (re-check with backoff).

### M6 — EventSource / timer leak (`presence.ts`, `collaboration.ts`)
**New:** add `connectingRef` guard; clear any pending reconnect timer before
setting a new one (`clearTimeout(pendingTimerRef.current)`); close the previous
`EventSource` before opening a new one.

### M7 — syncProject divergent remote (`src/lib/supabaseRemote.ts:~219`)
**New:** implement pull-remote-then-rebase (or a 3-way merge using the last
common base); on conflict, prefer remote base + local ops rather than setting
`conflicts=1` and doing nothing.

### M8 — single-callback listeners
**New:** `setOnProjectSaved` (`projectStore.ts:56`) and `onRegistryStateChange`
(`commandRegistry.ts`) keep a `Set<callback>`; `emit`/`notify` iterates the set.

### M9 — empty catch without `e`
**New:** capture `(e)` and `console.warn(...)` at `crdt.ts:153`,
`collaboration.ts:~47,75,123,321`, `presence.ts:~55,65,192`,
`projectStore.ts:~376,396`, `busRouter.ts:~92,93,96,99`.

## UI / 3D

### H7 — 3D effect cleanup (`app/virtual-studio.tsx:337`, `dj-stage.tsx:318`, …12 rooms)
**Current:**
```ts
useEffect(() => { let cancelled = false; let cleanup; init().then(fn => { if (cancelled) fn(); else cleanup = fn; }); return () => { cleanup?.(); }; }, []);
```
`cleanup?.()` runs but `cancelled` is never set, and if unmounted before
`loadThree()` resolves the rAF/scene/listeners leak.
**New:**
```ts
return () => { cancelled = true; cleanup?.(); };
```
and ensure `init().then(fn => { disposed ? fn() : (cleanup = fn); })`.

### H8 — resize listener leak (`app/mixing-console.tsx:~654`)
**New:** `return () => { cancelled = true; cleanup?.(); window.removeEventListener("resize", handleResize); };`

### H9/H10 — window.electronAPI bypass (`src/components/GenerateCoverModal.tsx:269`)
**New:** replace `typeof window !== "undefined" && !!window.electronAPI` with a
capability check via `OpenBandNative` / `Platform.OS` (e.g.
`await OpenBandNative.isAvailable?.()` or `Platform.OS === "web"` guard).

### M10 — scene disposal (`src/lib/sceneLighting.ts` + 3D scenes)
**New:** expose a disposer from `addSceneBulb`/`addRGBStrip` returning a cleanup
fn that disposes geometry/material/`CanvasTexture`; on unmount, traverse the
scene disposing all geometry/material/textures, then
`renderer.forceContextLoss()` after `renderer.dispose()`.

### M11 — 0-channel buffer guard (`src/lib/aiAutoMixAnalysis.ts:~73`)
**New:** `if (buffer.numberOfChannels === 0) return safeDefaultAnalysis;`
before `getChannelData(0)`.

## BACKEND

### H10 — bridge boundary (see H9 above; counted once).

### M12 — GENRE_PATTERNS.pop / DRUM_PATTERNS.pop (`backend/src/routes/generator.ts:75-76`)
**Current:** `GENRE_PATTERNS.pop` / `DRUM_PATTERNS.pop` are `undefined`
(`Record`, not array, defined `:25`/`:38`).
**New:** default to `GENRE_PATTERNS["pop"]` / `DRUM_PATTERNS["pop"]` (and the
inner `:82` `DRUM_PATTERNS.pop` → `DRUM_PATTERNS["pop"]`).

### M13 — requireAuth on SSE/downloads
**New:** apply `requireAuth` (or a project-token check) to `collab.ts`,
`presence.ts` routers, and `extract.ts:/api/stems/:filename` (~196),
`master.ts:/api/master/download/:filename` (~167).

### M14 — queue artifact/prune (`backend/src/services/queue.ts:~54`)
**New:** after a job finishes, delete `mock_*.wav` artifacts and prune the
completed job from the `jobs` Map (cap its size / TTL).

### M15 — fd leak + swallowed error (`backend/src/routes/extract.ts:~33,~78`)
**New:** wrap `fd.read`/`fd.close` in `try/finally` guaranteeing `fd.close()`;
replace `catch { return 0; }` with `catch (e) { logger.error(e); return 0; }`.

### M16 — generator try/catch (`backend/src/routes/generator.ts:~64`)
**New:** wrap handler body in `try/catch`; on error return a generic 500 with no
stack trace.

## File-Change Table (grouped by domain)

| Domain | File | Change | Live / Dead |
| --- | --- | --- | --- |
| AUDIO | `src/lib/wasmPluginHost.ts` | await addModule before node; revoke after | Dead-code |
| AUDIO | `src/lib/wasmInstrumentEngine.ts` | same | Dead-code |
| AUDIO | `src/lib/timeStretchVocoded.ts` | same | Dead-code |
| AUDIO | `src/lib/midiSynth.ts` | pass bpm to native render | Live |
| AUDIO | `src/lib/clockManager.ts` | defer worker blob revoke | Live |
| AUDIO | `src/lib/mastering.ts` | close OAC after render | Live |
| AUDIO | `src/lib/pluginChain.ts` | close OAC after render | Live |
| AUDIO | `src/lib/previewEngine.ts` | close OAC after render | Live |
| AUDIO | `src/lib/universalAudio.ts` | duration<=0 guard | Live |
| AUDIO | `src/lib/chunkedRenderer.ts` | shared AudioContext for buffer | Live |
| AUDIO | `src/lib/transientDetection.ts` | shared AudioContext for buffer | Live |
| AUDIO | `src/lib/audioTelemetry.ts` | separate true peak | Live |
| STATE | `src/lib/crdt.ts` | commutative add + Lamport + catch e | Live |
| STATE | `src/lib/projectBranching.ts` | build-then-assign mergeBranch | Live |
| STATE | `src/lib/projectStore.ts` | bound bridge queue + catch e | Live |
| STATE | `src/lib/presence.ts` | connecting guard + clear timer + catch e | Live |
| STATE | `src/lib/collaboration.ts` | connecting guard + clear timer + catch e | Live |
| STATE | `src/lib/supabaseRemote.ts` | pull-remote-then-rebase | Live |
| STATE | `src/lib/commandRegistry.ts` | Set of listeners | Live |
| STATE | `src/lib/busRouter.ts` | catch e | Live |
| UI-3D | `app/virtual-studio.tsx` + 12 rooms | cancelled=true cleanup | Live |
| UI-3D | `app/mixing-console.tsx` | remove resize listener | Live |
| UI-3D | `src/components/GenerateCoverModal.tsx` | use @bridge capability | Live |
| UI-3D | `src/lib/sceneLighting.ts` + scenes | dispose geometries/materials | Live |
| UI-3D | `src/lib/aiAutoMixAnalysis.ts` | 0-channel guard | Live |
| BACKEND | `backend/src/routes/generator.ts` | pop→["pop"] + try/catch | Live |
| BACKEND | `backend/src/routes/extract.ts` | try/finally fd + log error | Live |
| BACKEND | `backend/src/routes/master.ts` | requireAuth on download | Live |
| BACKEND | `backend/src/routes/collab.ts` / `presence.ts` | requireAuth | Live |
| BACKEND | `backend/src/services/queue.ts` | artifact cleanup + prune | Live |

## Verification (full matrix)

1. `npx tsc --noEmit` → 0 errors (our edits must not introduce errors).
2. `cd backend && npx tsc --noEmit` → 0 errors.
3. `npx vitest run` → all pass (no regression; the 6 previously-fixed suites stay green).
4. `npm run test:legacy` → pass.
5. `npm run graph:ci` → CI PASS.
6. `npm run build` → pass.
