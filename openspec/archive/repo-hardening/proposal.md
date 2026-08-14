# Repo Hardening — Spec (from full-repo code review)

## Context

A full-repo static review (src/, app/, backend/, root config, graph/, openspec/, docs)
surfaced concrete defects across five axes: **security**, **correctness bugs**,
**convention violations**, **documentation drift**, and **test gaps**. None are
blocking the current build, but several are real security holes (auth bypass,
unauthenticated upload routes) and correctness bugs (mock stem 404s, NaN timers).

This change consolidates the review findings into an actionable hardening backlog.
Items are triaged MUST / SHOULD / COULD. Each MUST item is independently shippable;
COULD items (comment removal, doc recounts) are bulk-churn and may be split.

## Severity summary

| # | Area | Finding | Severity |
|---|------|---------|----------|
| S1 | backend `tierGuard.ts` | `getTierFromRequest()` trusts client `x-user-tier` header → FREE user bypasses paid tier | **MUST (security)** |
| S2 | backend `app.ts` | No global `requireAuth`; `/api/extract`, `/api/master/bounce`, `/api/export/*`, `/api/generate-midi` accept unauthenticated 200MB uploads | **MUST (security)** |
| S3 | backend `sessionBlacklist.ts` | "hash" = `token.substring(0,16)` — collides on prefix, not a hash | **MUST (security)** |
| S4 | electron `main.js` | `sandbox:false` weakens renderer isolation | SHOULD (security) |
| B1 | backend `queue.ts` | Mock stems return URLs never written → 404s | **MUST (bug)** |
| B2 | backend `master.ts` | Bounce copies bytes but reports transcoded bitDepth/sampleRate/format | **MUST (bug)** |
| B3 | backend `extract.ts` | `duration:30` hardcoded, ignores real file | SHOULD (bug) |
| B4 | backend `presence.ts` | `lastSeen` never set → `NaN`, stale cleanup never fires | SHOULD (bug) |
| B5 | app `_layout.tsx` | reads `window.electronAPI` directly (desktop leak) | **MUST (convention)** |
| B6 | app `tabs/_layout.tsx` | `index` + `feed` both register Feed as two tabs (dup route) | **MUST (bug)** |
| B7 | src `hardwareIO.ts` | `patchState = {...patchState, routes: patchState.routes}` no-op; line 80 two statements jammed | SHOULD (bug) |
| B8 | src `midiLearn.ts`↔`mcu.ts` | Mutual import cycle (only `OB-GRAPH-002` error on clean tree) | SHOULD (bug) |
| G1 | graph `specs.mjs` | `PATH_RE` captures method chains (`musicTheory.resolveProgression`) + build artifacts → spurious `OB-GRAPH-003` | SHOULD (bug) |
| G2 | graph `validate.mjs` | `OB-GRAPH-004` allowlist omits `scripts/` → 8 false orphans | SHOULD (bug) |
| G3 | graph `core.mjs`/`builder.mjs` | `createGraphFrom`/`loadGraph` exported but unused | COULD (dead code) |
| C1 | src `Toast.tsx`,`Skeleton.tsx` | `StyleSheet.create` violates className convention | SHOULD (convention) |
| C2 | src `Sidebar.tsx` | `require()` for asset instead of import | SHOULD (convention) |
| C3 | app `explorer.tsx` | iframe `importmap` + `import "three"` bypasses `loadThree()` CDN pattern | SHOULD (convention) |
| C4 | app `mastering/index.tsx` | `useState(() => ...)[0]` captures non-reactive initial value | SHOULD (convention) |
| C5 | src `bridge/tauri.ts` | `writeFile` silently no-ops while `readFile` throws (parity) | SHOULD (convention) |
| C6 | pervasive | Inline `//` comments across 3D screens + lib files (no-comments rule) | COULD (convention) |
| D1 | AGENTS.md/README.md | "70 components / 1479 tests / 80 files" stale (actual ~81 / ~1536 / 83) | SHOULD (docs) |
| D2 | docs `features-analysis`,`testing-mocks`,`HY3-HANDOFF` | "1456 tests" / SDK 56 claims | SHOULD (docs) |
| D3 | openspec `specs/**` + `archive/**` | Dead repo-path citations (`api/auth/*`, `src/lib/midiMcu.ts`, `app/build.gradle`→`android/`, `src/components/Mastering`) → `OB-GRAPH-003` noise | SHOULD (docs) |
| K1 | root `package.json` | `typescript:~6.0.3` invalid GA; `test:legacy` uses uninstalled `tsx` | **MUST (config)** |
| K2 | `vitest.config.ts` | `dangerouslyIgnoreUnhandledErrors:true` masks test failures | SHOULD (config) |
| K3 | backend `tsconfig.json` | missing `noUnusedLocals`/`noUnusedParameters` | SHOULD (config) |
| T1 | backend routes | No supertest coverage for extract/master/presence/collab/stems/export | SHOULD (test gap) |
| T2 | src/lib | Untested: `chunkedRenderer`,`habboAssets`,`lazyDrumKit`,`loadThree`,`projectEncryption`,`timeStretchVocoded` | SHOULD (test gap) |

## Objectives

1. Close the two security holes (S1 tier bypass, S2 unauthenticated uploads) and
   fix the blacklist hash (S3).
2. Repair the correctness bugs that produce broken runtime behavior (B1–B4, B6).
3. Remove the desktop-binding leak (B5) and the duplicate tab route (B6).
4. Fix the graph toolchain false positives (G1, G2) so `graph:ci` results are
   trustworthy.
5. Realign docs/test counts/config to reality (D1–D3, K1–K3).
6. Backfill the highest-risk test gaps (T1 backend routes, T2 security-critical
   `projectEncryption`/`timeStretchVocoded`).

## Out of scope

- Removing all inline comments repo-wide (C6) is bulk churn; defer to a separate
  cosmetic pass or do selectively.
- Refactoring the entire 3D scene stack to a shared component (only `explorer.tsx`
  is singled out, C3).
- New dependencies are NOT introduced (K1 fix pins existing `typescript` to `^5`).

## Success criteria

- `POST /api/extract` (and other protected routes) reject unauthenticated requests.
- Tier enforcement derives from verified JWT, not request headers.
- `npm run test:legacy` and `npm run build` succeed without fetching/installing
  missing packages.
- `node graph/cli.mjs ci` reports zero `OB-GRAPH-001/002` errors on a clean tree
  (the midiLearn↔mcu cycle resolved or explicitly documented as accepted).
- AGENTS.md/README.md counts match `src/components/index.ts` export count and
  `node --test` / vitest actual totals.
- New backend route tests + `projectEncryption`/`timeStretchVocoded` tests pass.
