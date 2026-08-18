# Tasks: regression-tests-round2 — Lock In code-review-round2 Fixes With Regression Tests

> **Status: PROPOSED.** All items pending. WRITING task ONLY — create new vitest
> test files and edit two existing test files so they collect. No source edits.

## AUDIO

- [ ] Create `tests/regression-round2-audio.test.ts` importing `vitest` (`describe, it, expect, vi`) — must NOT import `node:test` or `express`.
- [ ] Stub `AudioContext` / `OfflineAudioContext` globals (constructor, `decodeAudioData`, `startRendering`, `close`, `createBuffer`, `sampleRate`).
- [ ] Stub `navigator.mediaDevices.getUserMedia` via `vi.stubGlobal` to spy on mic stream creation.
- [ ] `it()` audioTelemetry peakCpu is true max — `recordCpuLoad` + `getAverageMetrics` returns `peakCpu` equal to the true max across the window (not running max of last bucket).
- [ ] `it()` latencyMonitor startDirectMonitor re-entrant guard — calling twice starts only one mic stream (second returns early via `monitorState.enabled`).
- [ ] `it()` wasmInstrumentEngine detectSampleRate positive — returns a number > 0.
- [ ] `it()` wasmInstrumentEngine createUnifiedInstrumentEngine uses passed rate — `createUnifiedInstrumentEngine(preset, 48000)` sets engine sample rate to 48000 (getter/`setSampleRate` spy or field probe).
- [ ] `it()` (conditional) wasmPluginHost chunked btoa round-trips large array without `RangeError` — SKIP if helper not exported.
- [ ] Confirm the suite collects in root `npx vitest run`.

## STATE

- [ ] Create `tests/regression-round2-state.test.ts` importing `vitest` only.
- [ ] `it()` crdt mergeOperations >100k ops — no `RangeError` (no spread); `localClock` raised to max timestamp; idempotent re-merge yields same result.
- [ ] `it()` collaboration flush failure preserves queue — mock `fetch` rejects; offline queued ops remain after failed flush.
- [ ] `it()` projectStore setOnProjectSaved unsubscribe — returns fn that removes ONLY that listener (others remain).
- [ ] `it()` snapshotManager applies bus.add/update/remove on replay — no drop.
- [ ] `it()` projectBranching filterBranchOps + mergeBranch — update/remove for unaccepted tracks filtered; no double-application (materialized tracks consistent with crdtOperations).
- [ ] `it()` commandRegistry transport play/stop distinct — play=Space, stop=Shift+Space (not both Space).
- [ ] Confirm the suite collects in root `npx vitest run`.

## UI/3D

- [ ] Create `tests/regression-round2-ui.test.ts` importing `vitest` only.
- [ ] `it()` aiAutoMixAnalysis detectRole kick explicit — `"kick"` => `"kick"`.
- [ ] `it()` aiAutoMixAnalysis detectRole drum alone not kick — `"drum"` => NOT kick.
- [ ] `it()` aiAutoMixAnalysis detectRole drum low is kick — `"drum low"` => `"kick"` (parenthesized `&&`).
- [ ] `it()` aiAutoMixAnalysis aggregate/analyze empty safe default — no `NaN` LUFS, no `-Infinity` peak.
- [ ] Note rendering-only fixes (spatial-audio listeners H5, emissive M19, fader baseY M20, WaveformCanvas resize M18, CommandPalette nav M16/M17) as tsc/runtime-verified, no vitest assertion.
- [ ] Confirm the suite collects in root `npx vitest run`.

## BACKEND

- [ ] Edit `tests/backend-routes.test.ts` — replace Node `express` import with `vi.mock("express", ...)` minimal in-process stub so the file collects in vitest.
- [ ] Edit `tests/backend-routes.test.ts` — add valid `Bearer` token to existing POST /extract and POST /master/bounce requests so they return expected status (not 401).
- [ ] `it()` (regression) POST /extract WITHOUT auth => 401.
- [ ] `it()` (regression) presign/head for key NOT under `${userId}/` => rejected.
- [ ] `it()` (regression) download for filename not prefixed with caller userId => 403/404.
- [ ] Add the regression assertions in `tests/backend-routes.test.ts` or a new `tests/regression-round2-backend.test.ts` (mocked `express` + `requireAuth` + ownership scoping).
- [ ] Edit `tests/futureRoadmap.test.ts` — replace `import { describe, it } from "node:test"` with `import { describe, it, expect } from "vitest"`; convert node:test-only assertions to `expect(...)`.
- [ ] Confirm both `tests/backend-routes.test.ts` and `tests/futureRoadmap.test.ts` now collect + pass in root `npx vitest run` (0 collection failures).

## LIB

- [ ] Create `tests/regression-round2-lib.test.ts` importing `vitest` only.
- [ ] `it()` keyboard Delete key fires delete — dispatch `{key:"Delete"}`.
- [ ] `it()` keyboard Escape key fires escape — `{key:"Escape"}`.
- [ ] `it()` keyboard Backspace key fires backspace — `{key:"Backspace"}`.
- [ ] `it()` keyboard uppercase DELETE still fires delete — `{key:"DELETE"}` (lowercased comparison).
- [ ] `it()` projectTemplates generateTracksForGenre plugin ids unique across all tracks (include track index).
- [ ] `it()` openbandFormat parseArchive throws on CRC32 mismatch (corrupt one entry's bytes).
- [ ] `it()` openbandFormat save/load round-trips a project (web Blob path, stubbed as needed).
- [ ] `it()` projectEncryption large payload round-trips (chunked btoa, no RangeError).
- [ ] `it()` i18n initialLanguage defaults to `"en"` when device language not in resources.
- [ ] Confirm the suite collects in root `npx vitest run`.

## Verification (run after implementation)

- [ ] `npx vitest run` → all pass, INCLUDING `tests/backend-routes.test.ts` and `tests/futureRoadmap.test.ts` (now collect + pass). 0 collection failures.
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `npm run graph:ci` → CI PASS.
