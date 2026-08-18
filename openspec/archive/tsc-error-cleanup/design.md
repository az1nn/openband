# Design: tsc Error Cleanup — Remove Shadowing Ambient Declaration

## Status: SHIPPED

## 1. Delete the shadowing ambient declaration

### Current (`src/react-native.d.ts`)
```ts
declare module 'react-native';
```

### Action
**DELETE** the file entirely. `react-native@0.86` ships real types
(`node_modules/react-native/types/index.d.ts`, resolved via the package
`types`/`exports`). The empty ambient declaration shadows them and causes
~52 cascade errors.

### Evidence (re-confirmed empirically)
| State | Total `tsc` errors | TS7016 |
| --- | --- | --- |
| With `src/react-native.d.ts` | 84 | 0 |
| Without `src/react-native.d.ts` | 33 | 0 |

TS7016 stays 0 in both states → the d.ts was never fixing an implicit-`any`
problem; it was purely destructive. After deletion, 33 genuine/test errors
remain and are addressed below.

## 2. Add a project-wide PNG ambient declaration

### New file: `src/declarations.d.ts`
```ts
declare module '*.png';
```

`tsconfig.json` `include` already contains `**/*.ts`, so this file is picked
up automatically (no tsconfig edit needed). If `expo/tsconfig.base` (which the
root tsconfig `extends`) already declares `*.png`, this decl is redundant but
harmless. It is the safe fallback that guarantees TS2307 in `Sidebar.tsx` is
resolved regardless of Expo's base.

## 3. Genuine source error fixes (A)

### A1. `src/components/MpcPadGrid.tsx:93`
**Current:** handler param typed `({ pressure?: number })` is assigned to a
prop expecting `(event: PointerEvent) => void`.

**Fix (sketch):**
```ts
// before
const handlePress = ({ pressure }: { pressure?: number }) => { ... }
// after — match the prop's PointerEvent signature
const handlePress = (event: PointerEvent) => {
  const pressure = (event as PointerEvent & { pressure?: number }).pressure;
  ...
}
```
(Adjust the prop type to accept the actual event if that is cleaner; the goal
is to satisfy the `(event: PointerEvent) => void` contract without an implicit
`any`.)

### A2. `src/components/Sidebar.tsx:27`
**Current:**
```ts
import logoDark from '../../assets/logo-dark.png'; // TS2307
```
**Fix:** resolved by the `declare module '*.png';` in §2. No source edit to the
import line required (unless the project prefers an explicit asset import
helper — out of scope).

## 4. Test-file error fixes (C) — per-file sketches

### C1. `tests/studioToolsComprehensive.test.tsx` (15 errors)
- 13 × `TS2613` — uses `import Synth from '…'` (default import) but components
  are **named** exports.
  **Before:** `import Synth from '@/components/Synth';`
  **After:** `import { Synth } from '@/components/Synth';`
  Apply the same `{ Component }` change to every default-imported component in
  this file (e.g. `Synth`, `Sampler`, `PianoRoll`, `ChordTrack`, `PluginEditor`,
  etc. — whichever are referenced).
- 1 × `TS6133` — unused `React` import. **After:** remove `import React from 'react';`
  (rely on the automatic JSX runtime) or switch to `import * as React`.
- 1 × `VersionHistory` import — component was renamed / moved. **After:**
  `import { MasteringVersionManager } from '@/components/MasteringVersionManager';`
  (use the correct export name/path; verify against
  `src/components/MasteringVersionManager.tsx`).

### C2. `tests/collabSync.test.ts` (9 errors) — non-trivial cluster
Errors: `TS2345×5`, `TS2339×2`, `TS18046`, `TS2554`.
The test calls the CRDT API with outdated signatures. **Before fixing the
test, read `src/lib/crdt.ts` and `src/lib/yjsCRDT.ts`** to learn the current
API. Expected mismatches:
- `applyOp(1, …)` — the `lamport`/node-id argument is no longer a bare number;
  pass the current node-id type (string or structured id per the current API).
- `CrdtOperation[]` passed where a single operation / string identifier is
  expected — align with `applyOp(op: CrdtOperation)` (or the batch form if the
  API supports it).
- `.lamport` / `.tempo` field access — these fields no longer exist on the
  operation/state shape; read the current `CrdtOperation` / state interface and
  use the replacements (e.g. `clock` / `lamportClock`, or a `tempo` field on a
  different object).
- `TS2554` — wrong argument count/order on a CRDT method; match the current
  signature.

**Fix:** update the test to the *current* public API. Do **not** change the
library API unless a test reveals a genuine defect. After aligning, the 9
errors should clear.

### C3. `tests/masteringAdvanced.test.ts` (2 errors — `TS2345`)
Plugin fixture objects are missing required fields. **Before:**
```ts
const plugin = { type: 'eq' }; // missing id/enabled/params or name/description/plugins
```
**After:** add the required fields to match `Plugin` / `MasteringChainSlot`
shape (e.g. `id`, `enabled`, `params`, and where a suite is expected,
`name`/`description`/`plugins`). Build the fixture from a real factory if one
exists (`src/lib/mastering.ts` or a test helper).

### C4. `tests/backend-routes.test.ts` (2 errors — `TS2769`)
`supertest` is given a `Router` where an `Application` is expected.
**Fix:** type the app correctly — either `import express from 'express'` and
create `const app = express(); app.use(router);` to pass an `Application`, or
cast the router to the expected type. Prefer constructing the `Application` so
the test exercises the real mount.

### C5. `tests/components5.test.tsx` (1 error — `TS2488`)
Iterating a `NodeListOf` with `for…of` without an iterator. **Fix:** wrap with
`Array.from(nodeList)` before iterating.

### C6. `tests/lib-security.test.ts` (2 errors — `TS2339` + `TS6133`)
- `TS2339` — `await`ing the `Promise<AudioBuffer>` is missing, so `.length` is
  accessed on a `Promise`. **Fix:** `const buf = await getAudioBuffer(...);
  buf.length;`.
- `TS6133` — unused `threw` variable. **Fix:** remove the unused declaration (or
  use it in the assertion).

### C7. `tests/components.test.tsx` (1 error — `TS2339` `value` on `TextInputProps`)
The `value` access may already resolve after the d.ts deletion. If it persists,
fix the test's prop usage to match `TextInputProps` from `src/components/`
(or the RN `TextInput` props it forwards).

### C8. `VersionHistory` import (any remaining test)
As in C1, replace `VersionHistory` imports with `MasteringVersionManager` and
the correct path/module.

## 5. Components / Files Affected

| File | Change |
| --- | --- |
| `src/react-native.d.ts` | **DELETE** (shadowing declaration) |
| `src/declarations.d.ts` | **NEW** — `declare module '*.png';` |
| `src/components/MpcPadGrid.tsx` | edit — type handler param as `PointerEvent` |
| `src/components/Sidebar.tsx` | (no edit needed; covered by §2) |
| `tests/studioToolsComprehensive.test.tsx` | edit — named imports, drop unused `React`, fix `VersionHistory` import |
| `tests/collabSync.test.ts` | edit — align to current CRDT API |
| `tests/masteringAdvanced.test.ts` | edit — add required plugin fixture fields |
| `tests/backend-routes.test.ts` | edit — pass an `Application` to supertest |
| `tests/components5.test.tsx` | edit — `Array.from(NodeListOf)` |
| `tests/lib-security.test.ts` | edit — `await` the `AudioBuffer`, drop unused `threw` |
| `tests/components.test.tsx` | edit — fix `TextInputProps` usage if it persists |
| `openspec/archive/env-build-and-types-fixes/design.md` | optional — append correction note |

> The `metro.config.js` `Expo.fx` stub is **explicitly out of scope** and must
> remain unchanged.

## 6. Test Requirements (implied / verification)

- `npx tsc --noEmit` → **0 errors** (was 84; 33 remain after d.ts removal and
  are all fixed here).
- `tsconfig.json` `include` (`**/*.ts`) picks up `src/declarations.d.ts`
  automatically — no config edit required.
- Fixing the test imports/types also repairs suites that were previously failing
  for the same reasons (studioToolsComprehensive, collabSync,
  masteringAdvanced, backend-routes, components5, lib-security).

## 7. Verification

1. `npx tsc --noEmit` → 0 errors.
2. `npx vitest run` → no regression (the corrected test suites above pass).
3. `npm run test:legacy` → pass.
4. `npm run graph:ci` → CI PASS.
5. `npm run build` → still PASS (d.ts removal is type-only; Expo.fx stub
   unchanged).
6. `cd backend && npx tsc --noEmit` → pass.
