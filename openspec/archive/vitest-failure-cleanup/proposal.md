# Proposal: Vitest Failure Cleanup (1 Source Defect + 4 Stale Assertions)

## Status: SHIPPED

## Context

6 vitest test cases currently fail. Investigation shows they are **pre-existing
failures, unrelated to the prior type-cleanup work**. Root cause breakdown:

- **1 real source defect** — `src/bridge/tauri.ts` returns fake absolute paths
  from its stub methods, contradicting the documented Tauri stub contract.
- **4 stale test assertions** — the application behavior is internally
  consistent and correct; the tests assert wrong/stale values that no longer
  match the source.

No production behavior needs to change except the Tauri stub return values
(which are explicitly meant to be null/empty stubs per AGENTS.md).

## Problem Description

### F1 — Tauri stub returns fake absolute paths (real defect)
`src/bridge/tauri.ts` `getDocumentsPath()` / `getAppDataPath()` return
`"/mock/documents"` / `"/mock/appdata"`. AGENTS.md states the Tauri bridge is a
**stub** ("all methods warn + return null"). Returning plausible-but-fake
absolute paths contradicts the contract and the tests' safe-empty expectation.
Two tests fail:
- `tests/studioToolsPlaybackDevice.test.ts` → "tauriBridge handles desktop stub
  operations safely"
- `tests/studioToolsPlaybackDevice.test.ts` → "OpenBandNative auto-detects
  Tauri..."

Fix: change both to `return "";` while keeping the `warnStub` call.

### F2 — `GENRES` length assertion is stale (10 vs 13)
`tests/lib.test.ts` (~L431) and `tests/specs-group6.test.ts` (~L44) assert
`GENRES` has length `10`. The source `GENRES` in `src/lib/projectTemplates.ts`
(~L151) has **13** entries
(`pop, rock, edm, hiphop, jazz, lofi, rnb, metal, acoustic, blues, trap, house,
dancehall`), all of which are rendered by the UI. 13 is correct.
Fix: change both assertions from `toHaveLength(10)` to `toHaveLength(13)`.

### F3 — musical key flat vs sharp (stale assertion)
`tests/projectCreationAdvanced.test.ts` (~L32) passes key `"Bb"`, but
`MUSICAL_KEYS` (in `src/lib/projectStarter.ts`) is sharp-only (`A#`, no `Bb`);
the UI key picker only offers sharps. `setupProjectStarter` falls back to the
pop default key `"C"` for an unrecognized key, so the test's expected output is
`"C"`. Fix: change test input `"Bb"` → `"A#"` so it asserts the canonical sharp
form.

### F4 — autotune local helper never rounds (stale assertion)
`tests/autotuneTool.test.ts` "quantizes pitches correctly" defines a local
`quantizePitch` that guards with `retuneSpeedCheck(0)` (returns `true` for `0`)
and returns the input unchanged, so `60.4` is never rounded to `60`.
Fix: prefer importing the real `quantizeToScale` from `src/lib/autotune.ts`;
if that is not straightforward, correct the local helper to return
`Math.round(midiNote)`.

## Objectives

1. Make the full vitest suite green (0 failures) by fixing **1 real stub-contract
   defect** (`src/bridge/tauri.ts`) and **4 stale test assertions**.
2. Introduce **no behavior regressions** — only the documented-empty Tauri stub
   return values change in source; all other changed behavior lives in tests.

## Non-Goals

- **Do NOT** change `GENRES` to length 10 — 13 is the intended UI list.
- **Do NOT** add flat-key (`Bb`) support to `MUSICAL_KEYS` — sharp-only is the
  canonical form.
- Known latent nit (out of scope, flagged only): `GENRES[jazz].defaultKey = "Bb"`
  is not present in `MUSICAL_KEYS`; it works only because the default is used
  directly by the app, never validated against `MUSICAL_KEYS`. Not part of this
  change.

## Approach Summary

- F1: `src/bridge/tauri.ts` — `getDocumentsPath()` / `getAppDataPath()` return
  `""` (keep `warnStub`).
- F2: `tests/lib.test.ts` + `tests/specs-group6.test.ts` — `toHaveLength(13)`.
- F3: `tests/projectCreationAdvanced.test.ts` — input `"Bb"` → `"A#"`.
- F4: `tests/autotuneTool.test.ts` — use real `quantizeToScale` or fix local
  helper to round.

## Risks

- Minimal. F1 only affects the unused/unimplemented Tauri stub path; the
  `detectBridge()` detection still switches to `tauriBridge` when `window.
  __TAURI__` is set, so the detection test continues to pass. F2–F4 are
  test-only corrections to stale assertions.
