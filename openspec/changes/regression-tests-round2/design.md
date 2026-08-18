# Design: regression-tests-round2 — Lock In code-review-round2 Fixes With Regression Tests

> **Status: PROPOSED.** No source edits. New vitest files only (+ editing two
> existing test files so they collect). Each domain below lists the new test file,
> the `it()` assertions, and the mocking strategy.

## AUDIO (new file `tests/regression-round2-audio.test.ts`)

**Mocking strategy**
- Global stub for `AudioContext` / `OfflineAudioContext` (constructor + `decodeAudioData`, `startRendering`, `close`, `createBuffer`, `sampleRate`).
- `vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: vi.fn() } })` to spy on mic stream creation for latencyMonitor.
- If `chunkedBtoa` (or similarly-named helper) is exported from `src/lib/wasmPluginHost.ts`, import + test; otherwise SKIP that `it()` with an early `return`/conditional import.

**`it()` assertions**
1. `audioTelemetry peakCpu is true max` — seed `recordCpuLoad` with a sequence whose trailing samples dip below the earlier peak (e.g. `[10, 95, 30, 20]`); assert `getAverageMetrics().peakCpu === 95` (true max, not running max of last bucket).
2. `latencyMonitor startDirectMonitor is re-entrant safe` — spy `getUserMedia`; call `startDirectMonitor()` twice; assert `getUserMedia` was called exactly once and the second call returned early (no second stream). Reset `monitorState` via `stopDirectMonitor()` if exported, else stub `monitorState.enabled` after first call.
3. `wasmInstrumentEngine detectSampleRate positive` — `detectSampleRate()` returns a number > 0.
4. `wasmInstrumentEngine createUnifiedInstrumentEngine uses passed sample rate` — `createUnifiedInstrumentEngine(preset, 48000)`; assert the engine sample rate is 48000 (via exported `getSampleRate()`/`setSampleRate` spy, or by checking that processing uses 48000). If no getter exists, probe the engine object's `sampleRate` field.
5. `wasmPluginHost chunked btoa round-trips large array` (only if helper exported) — build a `Uint8Array` of >200k random bytes, encode then decode, assert bytes equal and no `RangeError`.

**Coverage note:** The audio fixes H1 (OAC close), M5 (decode on OAC) are verified indirectly via the mocked `OfflineAudioContext.close()`/`decodeAudioData` spies (assert they are invoked). Time-stretch (M7) and envelope (M4) are DSP-continuous and excluded (tsc only).

## STATE (new file `tests/regression-round2-state.test.ts`)

**Mocking strategy**
- `vi.stubGlobal("indexedDB", ...)` not needed if collaboration offline-queue uses an injectable/mocked store; otherwise stub IDB with a minimal in-memory store.
- `vi.mock("...")` + `vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")))` for the flush-failure test; restore after.
- crdt/branching/snapshot/projectStore/commandRegistry are pure modules — import directly, no browser API needed.

**`it()` assertions**
1. `crdt mergeOperations handles >100k ops without RangeError` — build >100k ops with varying lamport timestamps; `mergeOperations`; assert no `RangeError` thrown, `localClock === maxTimestamp + 1`, and a second idempotent merge yields identical materialized state.
2. `collaboration preserves queued ops on flush failure` — mock `fetch` to reject; enqueue ops; trigger flush; assert the offline queue still contains those ops (not deleted).
3. `projectStore setOnProjectSaved returns unsubscribe removing only that listener` — register listener A and B; capture unsubscribe from `setOnProjectSaved(A)`; invoke unsubscribe; trigger save; assert B fires but A does not.
4. `snapshotManager applies bus add/update/remove on replay` — craft a state with a bus; apply `bus.add`, `bus.update`, `bus.remove` ops via `applyOperationToState` (or `mergeSnapshotIntoState`); assert the bus is added, mutated, then removed correctly (none dropped).
5. `projectBranching filters unaccepted update/remove and does not double-apply` — create branch ops where update/remove target an unaccepted track; `filterBranchOps` excludes them; `mergeBranch` produces materialized tracks consistent with `crdtOperations` (no duplicate/extra tracks from double-application).
6. `commandRegistry transport play/stop resolve to distinct bindings` — assert `transport.play` resolves to `Space` and `transport.stop` resolves to `Shift+Space` (not both `Space`).

## UI/3D (new file `tests/regression-round2-ui.test.ts`)

**Mocking strategy**
- `aiAutoMixAnalysis` is a pure module (no DOM) — import directly. No browser API mock needed for the logic tests.

**`it()` assertions**
1. `aiAutoMixAnalysis detectRole kick explicit` — `detectRole("kick")` => `"kick"`.
2. `aiAutoMixAnalysis detectRole drum alone is not kick` — `detectRole("drum")` => NOT `"kick"` (falls through to spectral classification).
3. `aiAutoMixAnalysis detectRole drum low is kick` — `detectRole("drum low")` => `"kick"` (parenthesized `&&` precedence).
4. `aiAutoMixAnalysis aggregate/analyze empty safe default` — `analyze([])` or `aggregate([])` returns an object with finite `lufs` (not `NaN`) and finite `peak` (not `-Infinity`).

**Intentionally tsc-only / runtime-verified (no pure helper to assert):**
- H5 spatial-audio leaked window/touch listeners.
- M19 emissive no-op on MeshToonMaterial.
- M20 fader cap `baseY + bob` absolute.
- M18 WaveformCanvas ResizeObserver redraw.
- M16/M17 CommandPalette keyboard nav + shared TextInput.

## BACKEND (fix `tests/backend-routes.test.ts` + new `tests/regression-round2-backend.test.ts`)

**Mocking strategy**
- `vi.mock("express", () => ({ default: <stub>, ... }))` OR `vi.mock("express")` returning a chainable `Router`/`app` stub that records route handlers so the test can invoke them in-process. Simplest: mock `express` to expose the route handler functions under test, then call `handler(req, res)` with a fake `res` (`status`/`json`/`send`) and assert status codes. This lets the file collect in vitest.
- Auth middleware (`requireAuth`) mocked/stubbed to read `req.headers.authorization` and set `req.userTokenData = { userId }` for valid `Bearer` tokens; reject (401) when absent/invalid.
- Ownership scoping: route handlers assert `req.userTokenData.userId` prefixes the requested key/filename.

**`tests/backend-routes.test.ts` edits**
- Replace Node `express` import with `vi.mock("express", ...)` minimal stub so the file collects.
- Add `Authorization: Bearer <valid>` header to existing requests against POST /extract and POST /master/bounce so they return expected status (e.g. 200 or accepted) instead of 401.

**`it()` assertions (regression — in that file or `tests/regression-round2-backend.test.ts`)**
1. `POST /extract without auth => 401` — call handler with no `Authorization`; assert 401.
2. `presign/head for key outside user prefix => rejected` — authenticated as `userA`, request key `userB/evil.wav`; assert rejection (e.g. 403/400).
3. `download for filename not prefixed with caller userId => 403/404` — authenticated as `userA`, request `/api/stems/userB/file.wav`; assert 403 or 404.

**`tests/futureRoadmap.test.ts` edits**
- Replace `import { describe, it } from "node:test"` with `import { describe, it, expect } from "vitest"`.
- Replace any `node:test`-only assertions (e.g. `assert.strictEqual`) with `expect(...).toBe(...)`.

## LIB (new file `tests/regression-round2-lib.test.ts`)

**Mocking strategy**
- `src/lib/keyboard.ts` — test the matcher by simulating keydown events through the exported handler (or a dispatch helper); stub `window`/event as needed with a fake `KeyboardEvent`-like object `{ key }`.
- `projectTemplates`, `openbandFormat`, `projectEncryption`, `i18n` are pure modules — import directly. `openbandFormat` web Blob path: stub `global.Blob`/`URL.createObjectURL` if required, or use the in-memory buffer path.
- Large payload + chunked btoa: build a multi-megabyte string; assert round-trip equality without `RangeError`.

**`it()` assertions**
1. `keyboard Delete key fires delete` — dispatch `{key:"Delete"}`; assert delete action fired.
2. `keyboard Escape key fires escape`.
3. `keyboard Backspace key fires backspace`.
4. `keyboard uppercase DELETE still fires delete` — dispatch `{key:"DELETE"}` (caps); assert delete action fired (lowercased comparison).
5. `projectTemplates generateTracksForGenre plugin ids unique` — `generateTracksForGenre(genre, ...)`; collect all plugin ids across tracks; assert `new Set(ids).size === ids.length`.
6. `openbandFormat parseArchive throws on CRC32 mismatch` — build a valid archive, corrupt one entry's bytes, assert `parseArchive` throws (CRC32 mismatch).
7. `openbandFormat save/load round-trips a project` — save a project, load it back; assert equality (web Blob path, stubbed as needed).
8. `projectEncryption large payload round-trips` — encrypt a multi-MB payload, decrypt; assert equality (no `RangeError`).
9. `i18n initialLanguage defaults to en` — init/initialLanguage with a device language not present in resources; assert default === `"en"`.

## File-Change Table

| Domain | New / Edited file | Change | Type |
| --- | --- | --- | --- |
| AUDIO | `tests/regression-round2-audio.test.ts` | new vitest suite | test |
| STATE | `tests/regression-round2-state.test.ts` | new vitest suite | test |
| UI/3D | `tests/regression-round2-ui.test.ts` | new vitest suite | test |
| BACKEND | `tests/backend-routes.test.ts` | edit: mock express + Bearer token | test |
| BACKEND | `tests/regression-round2-backend.test.ts` | new vitest suite (or appended) | test |
| BACKEND | `tests/futureRoadmap.test.ts` | edit: node:test -> vitest | test |
| LIB | `tests/regression-round2-lib.test.ts` | new vitest suite | test |

## Verification (intended — run after implementation)
1. `npx vitest run` → all pass; `backend-routes.test.ts` + `futureRoadmap.test.ts` now collect; 0 collection failures.
2. `npx tsc --noEmit` → 0 errors.
3. `npm run graph:ci` → CI PASS.
