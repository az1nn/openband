# Code Review Checkpoint — OpenBand (2026-08-20)

Full-repo checkpoint review (code + test cases) covering Audio/DSP, State/Collab, UI/3D,
Backend, and remaining lib + test infra. Findings were produced by parallel `code-review`
subagents per domain, then consolidated here.

> **Verification note:** Two "HIGH" State/Collab findings (collaboration.ts, projectBranching.ts)
> are serious and should be independently verified before fixing — they were reported on a
> branch that did **not** contain the V10 modules, and the reviewer may have misread control
> flow. Test counts below vary by branch (master ~1660 vitest; V10-merged branch ~1734).

---

## Severity summary

| Severity | Count | Domains |
|---|---|---|
| HIGH | 5 | Audio, State, Backend ×2 |
| MEDIUM | 15 | Audio, State, Backend, UI, Tests |
| LOW | ~14 | all |
| TEST GAPS | ~20 modules | all |
| GRAPH CI | 0 errors / 295 warnings | toolchain |

---

## HIGH (critical — fix first)

### H1. `midiScheduler.ts:151-164` — note double-scheduling / stacked voices
`scheduleNotesInWindow` re-schedules every note overlapping the lookahead window on each 25ms
tick with no "already fired" guard. Notes longer than `SCHEDULE_AHEAD` (0.15 beat) spawn a new
oscillator every tick → duplicate/stacked voices, pitch drift, CPU blowup.
**Fix:** track scheduled note indices in a `Set`; skip already-fired notes. **Untested.**

### H2. `src/lib/collaboration.ts:227,248,371` — remote ops never materialize *(verify)*
Incoming `"operations"`/`"fullState"` ops are added to `appliedOpIdsRef` **before**
`applyToState` runs, but `applyToState` filters `!appliedOpIdsRef.current.has(op.id)` → remote
edits merge into the op log but are never applied to local state. Silent stale-state for every
collaborator. **Fix:** only add to `appliedOpIdsRef` inside `applyToState` when actually applied.
**Untested** (collabSync.test.ts doesn't assert local-state arrival).

### H3. `src/lib/projectBranching.ts:311-313,328-330` — selective merge ignores rejections for modifications *(verify)*
Added tracks/buses are gated by `hasSelection`/`acceptedTracks`, but `applyTrackChanges`/
`applyBusChanges` are called **unconditionally** for every modified entity → rejected-but-modified
tracks/buses are always merged. **Fix:** mirror the added-track guard (`skip when hasSelection &&
!acceptedTracks.has(id)`). **Untested** (existing test only covers added tracks).

### H4. `backend/src/routes/extract.ts:100-128` — dead progress endpoint
`GET /extract/progress/:jobId` always 404s: POST `/extract` runs Demucs/mock inline and never
calls `addJob`, so `getJob()` is always `undefined`. **Fix:** wire POST through
`queue.addJob`/`notifyJobListeners` (like `stems.ts`), or delete the endpoint + deps.

### H5. `backend/src/routes/master.ts:113-140` — mastering bounce is a no-op
`POST /master/bounce` copies the upload byte-for-byte to `outputPath` and never applies
`pluginStates` (parsed at :150 then discarded). "Mastering" does nothing. **Fix:** implement the
chain or mark explicitly unimplemented. No vitest coverage.

---

## MEDIUM

### Audio / DSP
- **M1.** `src/lib/timeStretch.ts:1-58` — `pitchShift` writes `out[floor(readPos*ratio)]` with **no
  interpolation** and `newLength == input.length` → severe aliasing / silent gaps for any
  `semitones≠0`. Reuse `phaseVocoderStretch` or a band-limited resampler.
- **M2.** `src/lib/chunkedRenderer.ts:7-13` — module-level `sharedBufferContext` `OfflineAudioContext`
  created once, never closed → leak for app lifetime.
- **M3.** `src/lib/transientDetection.ts:7-13` — same never-closed shared `OfflineAudioContext`.
- **M4.** `src/lib/universalAudio.ts:346` — `renderMixdownWeb` `OfflineAudioContext` not closed after
  `startRendering`.
- **M5.** `src/lib/universalAudio.ts:748` — `exportTone` native returns `new Blob([new ArrayBuffer(44)])`
  (44 zero bytes = invalid WAV header).
- **M6.** `src/hooks/useUniversalAudio.ts:10` — `useAudioPlayer(source ?? "")` passes `""` when source
  is null → expo-audio loads empty source. Guard null before calling.

### State / Collab
- **M7.** `src/lib/crdt.ts:85-97` — non-add ops from the *same* `userId` on the same path are never
  deduplicated (conflict check requires `e.userId !== op.userId`) → repeated updates accumulate and
  replay compounds. Also match same-user same-path, replace by Lamport.
- **M8.** `src/lib/snapshotManager.ts:113` — `compactOperations` filters `op.timestamp > snapshot.version`
  mixing a Lamport clock with an arbitrary caller-supplied `version` → can silently drop ops. Define
  `version == max clock at snapshot time` and assert it.
- **M9.** `src/lib/projectBranching.ts:333-337` — `merged.crdtOperations` overwritten by
  `mergeOperations(main, branchOps)` after copying state → state/op-log divergence (double-apply risk).

### Backend
- **M10.** `src/lib/supabaseRemote.ts:70,153,180` — REST URLs interpolate `projectId`/`branch`/`hash`
  unencoded; these are attacker-controllable from CRDT sync → PostgREST filter injection. Use
  `encodeURIComponent` on every interpolated value.
- **M11.** `backend/src/routes/presence.ts:63` & `collab.ts:65` — backpressure `res.write()===false`
  deletes client but per-client `keepAlive` interval keeps writing to the orphaned socket forever
  (leaked interval). Remove from maps **and** `clearInterval`, or honor `drain`.
- **M12.** `backend/src/routes/presence.ts:213-220` & `collab.ts:216-225` — `userId` taken from request
  body, not bound to `req.userTokenData.userId` → any authenticated user can impersonate another
  (presence/operations integrity). Bind to token identity.

### UI / 3D
- **M13.** `tests/scenes.test.tsx:40-44,75-78,108-111,141-144` — flaky "3D Unavailable" tests: `loadThree`
  is not mocked, so they depend on the real CDN import throwing; under CI network access they can
  succeed and hang/fail the 5s `waitFor`. Mock `loadThree` to reject.
- **M14.** `app/virtual-studio.tsx:220` — click hit-test only intersects base `furnitureMeshes`; the
  `topMesh` highlight / label sprites are excluded → clicks on the top rim don't select furniture.
  Raycast the whole `furnitureGroup`.

### Tests / infra
- **M15.** `tests/graph-engineer.test.mjs`, `-v2`, `-v3`, `graph-ci-regression.test.mjs` — import
  `node:test` but are never executed (vitest `include` excludes `.mjs`; `test:legacy` only runs
  presets+types). ~50 describe/it blocks dead in CI. Add a `node --test tests/*.mjs` script or convert.
- **M16.** `src/lib/midiShared.ts` — orphaned (OB-GRAPH-004) **and** zero tests; contains MCU surface
  mapping + persistence logic. Add `tests/midiShared.test.ts`.

---

## LOW (cleanup)

- **L1.** `src/lib/subtractiveSynth.ts:213-215` — empty `catch {}` blocks (convention).
- **L2.** Comments in code (project forbids comments): `midiSynth.ts` (~30 lines),
  `universalAudio.ts:6-13` headers, `automix.ts:27,29,208`, `mastering.ts:207`,
  `canvasWaveform.ts:27,31,39`, `midiShared.ts:51,113`, and ~10 component files
  (`Screen3DFallback.tsx:13-14`, `MiniPlayer.tsx:106`, `Synth.tsx:546`, `OneKnob.tsx:333-336`, …).
  Remove.
- **L3.** `src/lib/collaboration.ts:152` — `navigator.onLine` read unguarded (no `Platform.OS`/`typeof`
  check) → unsafe if mounted on native.
- **L4.** `src/lib/history.ts:65-70` — `executeUndo`/`executeRedo` silently drop a command on failed
  `validate` with no signal/event.
- **L5.** `backend/src/routes/generator.ts:93` — `parseInt(safeTimeSig.split("/")[0])` → `NaN` on
  malformed input → `NaN` note starts. Validate time-signature shape.
- **L6.** `backend/src/app.ts:49` — CORS allows `origin === undefined` + any `*.vercel.app` (acceptable
  for bearer-token API, but note the wildcard).
- **L7.** `backend/src/routes/extract.ts:160` — `cleanup(req.file.path)` dead re-check (file guaranteed
  present).
- **L8.** `docs/3d-scene-guidelines.md:56` — doc drift: T7 (rAF pause on hidden tab) marked 🚫 NOT
  implemented, but `app/virtual-studio.tsx` already implements `document.hidden` +
  `visibilitychange`. Update guideline; still missing in the 12 tool rooms.

---

## TEST GAPS (modules with no / weak tests)

**Audio/DSP:** `midiScheduler.ts` (the H1 bug is untested), `automationEngine.ts` (exponential
interpolation / `cancelScheduledValues` ordering — critical volume path), `timeStretch.ts` /
`timeStretchVocoded.ts` (no DSP-correctness tests), `audioGraphValidation.ts` (no cycle-detection
test — production routing safety), `previewEngine.ts`, `subtractiveSynth.ts`,
`transientDetection.ts`, `chunkedRenderer.ts`, `openbandFormat.ts` (CRC32), `midiParser.ts`,
`useUniversalAudio.ts`.

**State/Collab:** `projectBranching` (selective *modified* reject untested — lets H3 pass CI),
`collaboration` (no test asserts remote ops reach local state — lets H2 pass CI), `crdt` /
`history` / `snapshotManager` / `snapshotPromotion` / `arrangementGenerator` / `commandRegistry` /
`supabaseRemote` / `projectStore` (no dedicated unit tests for Lamport monotonicity, undo/redo
corruption, snapshot `version` semantics, promotion-gate double-mint, arrangement-energy
boundaries — only incidental coverage in `lib*.test.ts`).

**UI/3D:** Only `live-room`, `lofi-tape`, `beatmaker`, `dj-stage` covered. Missing: `vocal-booth`,
`autotune`, `mixing-console`, `synth-lab`, `cover-jam`, `stem-collider`, `acoustics`,
`spatial-audio`, and the **hub `virtual-studio`** entirely (no router-push-on-select, WASD, or
LightControls ref test). No rAF/teardown assertion in any scene test. `LightControls.tsx` has no
dedicated unit test.

**Backend:** `tests/backend-routes.test.ts` is shallow (only `requireAuth` + handler-run). Missing:
extract POST happy-path + Demucs/mock fallback, `/stems/:filename` traversal guard, master download
guard, generator output shape, presence/collab SSE connect + `req.on('close')` cleanup + userId
spoofing, demucs `execPython` arg safety + `DEMUCS_NOT_FOUND`, mock WAV generation, supabaseRemote
URL-encoding. No vitest suite covers `master.ts`, `generator.ts`, `presence.ts`, `collab.ts`,
`services/demucs.ts`.

**lib/Tests:** `midiShared.ts` (none), `collaboration.ts` (orphan + none), `snapshotManager.ts`,
`arrangement.ts`, `previewEngine.ts`, `aiAutoMixAnalysis.ts`, `aiStemMastering.ts`, `dawproject.ts`,
`dawprojectExport.ts`, `hooks/useUniversalAudio.ts`, `useVoiceControl.ts`, `useAutoPush.ts`.

---

## GRAPH CI (toolchain)

- **Errors: 0 | Warnings: 295**
  - 178 × `OB-GRAPH-003` — stale OpenSpec path refs in `openspec/specs/*` and `openspec/archive/*`
    (e.g. `api/master/download`, `src/locales/en.json`, `app/creativeModes.ts`).
  - 40 × `OB-GRAPH-004` — orphans; **mostly false-positives** from dynamic imports
    (`canvasWaveform.ts`→lib3, `timelineGestures.ts`→lib6, `midiScheduler.ts`→lib3,
    `objectStorage.ts`→objectStorage.test.ts are actually tested).
  - 77 × `OB-GRAPH-005` — coverage gaps, many backend/scripts.

**Recommendation:** wire the 4 dead `.mjs` graph tests + add `midiShared.test.ts` first (cheap,
raises real coverage); comments are cleanup-only.

---

## False positives / annotations
- **State/Collab agent claimed V10 guard modules (seedDeterminism, lockPolicy, variationHistory,
  concurrencyGuard, audioResourceGuard, persistenceGuard) "do not exist."** This is **false** — they
  exist on the V10 branches (`feat/v10-section-b..h`, merged in `feat/v10-section-i`) with passing
  tests (B:14, C:12, D:7, E:10, F:8, G:8, H:7) + `tests/v10Regression.test.ts` (8). The reviewer was
  on a branch without them. **Not a gap.**
- Several `OB-GRAPH-004` orphans are runtime-dynamically-imported and are tested — treat as
  false-positives.

---

## Next step
Review the list above and we will **prioritize together** (e.g. severity-first, security/correctness
first, or by domain/user-impact), then implement fixes one batch at a time with tests.
