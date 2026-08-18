# Tasks: tsc Error Cleanup — Remove Shadowing Ambient Declaration

## Status: SHIPPED
> is 0 and all Phase-3 gates pass.

## Phase 1 — Spec (this change)
- [x] `proposal.md` — context, problem, objectives, non-goals (written).
- [x] `design.md` — empirical evidence, per-file fix sketches (written).
- [x] `tasks.md` — this checklist (written).

## Phase 2 — Implement (after spec approval)

### A. Remove the shadowing declaration
- [ ] **DELETE** `src/react-native.d.ts` (the `declare module 'react-native';`
      line). Confirm `node_modules/react-native/types/index.d.ts` exists so the
      real types resolve after deletion.

### B. Add PNG ambient declaration
- [ ] **CREATE** `src/declarations.d.ts` containing `declare module '*.png';`.
      Confirmed `tsconfig.json` `include` (`**/*.ts`) picks it up; no tsconfig
      edit required.

### C. Genuine source fixes
- [ ] `src/components/MpcPadGrid.tsx:93` — type the press handler param as
      `PointerEvent` (matching the `(event: PointerEvent) => void` prop) instead
      of `({ pressure?: number })`.
- [ ] `src/components/Sidebar.tsx:27` — TS2307 resolved by §B; no source edit to
      the import needed. Verify the error clears after §B.

### D. Test-file fixes
- [ ] `tests/studioToolsComprehensive.test.tsx` — change all default-imported
      components to named imports (`import { Synth } from '@/components/Synth'`,
      etc.); remove unused `React` import (TS6133); fix `VersionHistory` import
      to `MasteringVersionManager` (correct path/export).
- [ ] `tests/collabSync.test.ts` — read `src/lib/crdt.ts` + `src/lib/yjsCRDT.ts`;
      update the 9 errors to the current CRDT API (`applyOp` node-id type,
      `CrdtOperation` arg shape, current clock/`tempo` fields, correct arg
      count). Prefer fixing the test over changing the library API.
- [ ] `tests/masteringAdvanced.test.ts` — add required fields to plugin fixtures
      (`id`/`enabled`/`params`, and `name`/`description`/`plugins` where a suite
      is expected).
- [ ] `tests/backend-routes.test.ts` — construct/pass an `express.Application`
      (or correct cast) to `supertest` so `Router` is not passed where
      `Application` is expected (TS2769).
- [ ] `tests/components5.test.tsx` — wrap the `NodeListOf` with `Array.from(…)`
      before `for…of` iteration (TS2488).
- [ ] `tests/lib-security.test.ts` — `await` the `Promise<AudioBuffer>` before
      `.length` (TS2339); remove the unused `threw` variable (TS6133).
- [ ] `tests/components.test.tsx` — fix `TextInputProps` `value` usage if it
      persists after §A/§B (TS2339).
- [ ] Any remaining `VersionHistory` imports across `tests/` → replace with
      `MasteringVersionManager`.

### E. Archive correction note (optional)
- [ ] Append a correction note to
      `openspec/archive/env-build-and-types-fixes/design.md` stating that
      `src/react-native.d.ts` was harmful (shadowed real types) and was removed
      by this change; the `metro.config.js` `Expo.fx` stub remains.

## Phase 3 — Check (verification gates, run in order)
- [ ] `npx tsc --noEmit` → **0 errors** (baseline: 84 with d.ts; 33 without,
      all fixed here).
- [ ] `cd backend && npx tsc --noEmit` → pass.
- [ ] `npx vitest run` → no regression (corrected suites pass:
      studioToolsComprehensive, collabSync, masteringAdvanced, backend-routes,
      components5, lib-security).
- [ ] `npm run test:legacy` → pass.
- [ ] `npm run graph:ci` → CI PASS.
- [ ] `npm run build` → still PASS (type-only change; Expo.fx stub untouched).

## Remaining
- None beyond the gates above. Do NOT modify the CRDT/library APIs or add
  dependencies. Do NOT touch the `metro.config.js` `Expo.fx` stub.
