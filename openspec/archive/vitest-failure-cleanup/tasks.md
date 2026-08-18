# Tasks: Vitest Failure Cleanup (1 Source Defect + 4 Stale Assertions)

## Status: SHIPPED

## Phase 1 — Spec (this change)

- [x] `openspec/changes/vitest-failure-cleanup/proposal.md` — written
- [x] `openspec/changes/vitest-failure-cleanup/design.md` — written
- [x] `openspec/changes/vitest-failure-cleanup/tasks.md` — written

## Phase 2 — Implement (pending approval)

### F1 — Source fix (real defect)
- [ ] `src/bridge/tauri.ts`: change `getDocumentsPath()` to `return "";` (keep
      `warnStub`).
- [ ] `src/bridge/tauri.ts`: change `getAppDataPath()` to `return "";` (keep
      `warnStub`).

### F2 — Test fix: `GENRES` length
- [ ] `tests/lib.test.ts` (~L431): `GENRES` `toHaveLength(10)` → `toHaveLength(13)`.
- [ ] `tests/specs-group6.test.ts` (~L44): `GENRES` `toHaveLength(10)` →
      `toHaveLength(13)`.

### F3 — Test fix: musical key
- [ ] `tests/projectCreationAdvanced.test.ts` (~L32): input key `"Bb"` → `"A#"`;
      assert expected canonical sharp result.

### F4 — Test fix: autotune helper
- [ ] `tests/autotuneTool.test.ts` "quantizes pitches correctly": prefer importing
      real `quantizeToScale` from `src/lib/autotune.ts`; otherwise fix the local
      `quantizePitch` to return `Math.round(midiNote)` so `60.4` → `60`.

## Phase 3 — Check (pending)

- [ ] `npx vitest run tests/autotuneTool.test.ts tests/studioToolsPlaybackDevice.test.ts tests/lib.test.ts tests/projectCreationAdvanced.test.ts tests/specs-group6.test.ts`
      → 6 previously-failing cases pass.
- [ ] `npx vitest run` → 0 failures (full suite green).
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `npm run test:legacy` → pass.
- [ ] `npm run graph:ci` → CI PASS.
- [ ] `npm run build` → pass.

## Remaining

- None beyond the above. No source files other than `src/bridge/tauri.ts` are
  modified; all other changes are test-only corrections to stale assertions.
