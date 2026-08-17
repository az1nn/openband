# Proposal: tsc Error Cleanup — Remove Shadowing Ambient Declaration

> **Status: DRAFT.** Not started. Do NOT mark SHIPPED until `npx tsc --noEmit`
> reports 0 errors and all verification gates pass.

## Context

A prior archived change (`env-build-and-types-fixes`, committed & archived)
introduced `src/react-native.d.ts` containing a single line:

```ts
declare module 'react-native';
```

This was added under the (incorrect) belief that the `react-native` package
ships no type declarations. Investigation proved otherwise: `react-native@0.86`
**ships complete types** (`node_modules/react-native/types/index.d.ts`, resolved
through the package's `types`/`exports` field). The empty ambient declaration
therefore **shadows** the real module types.

### Empirical evidence (the core justification)

Running `npx tsc --noEmit` with the ambient file present vs. removed:

| State | Total errors | TS7016 (`any` implicit) |
| --- | --- | --- |
| With `src/react-native.d.ts` | **84** | 0 |
| Without `src/react-native.d.ts` | **33** | 0 |

The empty declaration does **not** fix the `TS7016` (both states already report
0) — it only *causes* ~52 cascade errors (TS2709 / TS2322 / TS7006 / TS7031 /
TS2694 / TS2353 + some TS6133 / TS2339). The 33 residual errors are genuine
source/test type errors that must be fixed independently.

> Note: the `Expo.fx` stub added to `metro.config.js` in that prior change is
> **still required** (expo@57.0.4 genuinely lacks `Expo.fx`). That stub is
> **out of scope** for this change.

## Problem Description

Two classes of problem:

1. **Shadowing ambient module declaration** (`src/react-native.d.ts`) — must be
   **deleted**. It masks the real `react-native` types and produces ~52 cascade
   errors across app/source and test files.

2. **Residual 33 genuine + test type errors** (after the deletion), split into:
   - **(A) Genuine app/source errors** — fix in `src/`:
     - `src/components/MpcPadGrid.tsx:93` — handler param typed
       `({pressure?: number})` assigned to a `(event: PointerEvent) => void`
       prop. Fix: type the handler param as `PointerEvent` (or adjust the prop
       signature to accept the real event shape).
     - `src/components/Sidebar.tsx:27` — `import logo-dark from
       '../../assets/logo-dark.png'` → TS2307 (no `.png` module declaration).
       Fix: add a project-wide ambient `declare module '*.png';`.
   - **(C) Test-file-only errors** — fix in `tests/` (mechanical except for the
     `collabSync` cluster). See `design.md` §3 for per-file sketches.

## Objectives

1. Reach a clean `npx tsc --noEmit` (**0 errors**) by:
   - Deleting `src/react-native.d.ts`.
   - Fixing the 2 genuine source errors (A).
   - Fixing the ~31 test-file errors (C).
2. Improve **test correctness** — several test files used `import X from '…'`
   (default import) against **named** component exports; this was both a type
   error *and* a latent runtime bug. Correcting them fixes both.
3. Keep the `metro.config.js` `Expo.fx` stub untouched.

## Non-Goals

- **Do NOT** modify the CRDT/library APIs (`src/lib/crdt.ts`, `yjsCRDT.ts`,
  etc.) unless a test reveals a *genuine* API defect. Prefer fixing the test to
  match the current API (esp. `collabSync.test.ts`).
- **Do NOT** add new dependencies.
- **Do NOT** touch the `metro.config.js` `Expo.fx` stub (carried from the prior
  change).

## Approach Summary

- **Delete** `src/react-native.d.ts` (the harmful shadowing declaration).
- **Add** `src/declarations.d.ts` with `declare module '*.png';` (safe fallback;
  `tsconfig.json` `include` already covers `**/*.ts`, so the file is picked up).
- **Edit** `src/components/MpcPadGrid.tsx` and `src/components/Sidebar.tsx`
  (genuine fixes).
- **Edit** the test files listed in `design.md` §3 (mechanical import/type
  corrections + the `collabSync` API-alignment).
- Optionally append a correction note to the archived
  `openspec/archive/env-build-and-types-fixes/design.md`.

## Risks

- `expo/tsconfig.base` (which `tsconfig.json` extends) may already provide
  asset module declarations; if so the `*.png` ambient decl is redundant but
  **harmless** and is the safe fallback. If Expo's base already covers `*.png`,
  the `Sidebar.tsx` error would have a different root; either way, adding the
  ambient decl resolves TS2307.
- Deleting the d.ts is **type-only**; it cannot affect runtime or the production
  `npm run build`.
