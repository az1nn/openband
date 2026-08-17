# Proposal: Env Build & Types Fixes (Unblock Verification Gates)

> **Status: PROPOSED.** Not yet SHIPPED. This change is a writing/spec-only
> stage; the implementation tasks are enumerated in `tasks.md` and the design
> lives in `design.md`.

## Context

Two pre-existing verification-gate failures block the standard OpenSpec check
sequence (see `AGENTS.md` Phase 3) in `/home/az1nn/openband`:

1. **`npm run build`** (which runs `expo export --platform web --clear && node scripts/post-export.js` — a **web** export via Metro, with no native prebuild) fails with:
   `Unable to resolve module ./Expo.fx from node_modules/expo/src/Expo.ts`.
2. **`npx tsc --noEmit`** reports **178 `TS7016: Could not find a declaration file for module 'react-native'`** across 173 files.

Investigation established that **both failures are ENVIRONMENT / install-integrity
issues, not app-source defects.** No application code needs to change to fix the
underlying logic; the fixes are minimal, dependency-free, in-repo shims that make
the gates pass while the root-cause environment is documented for canonical
remediation.

## Problem Description

### (A) Build gate — missing `expo` `Expo.fx` module

The installed `expo` package ships `node_modules/expo/src/Expo.ts`, which imports
`./Expo.fx`. However, **no `Expo.fx` file exists anywhere inside `node_modules/expo`**
(only `.d.ts` declarations are present). The default Metro config (produced by
`getDefaultConfig` in `metro.config.js`) has **no resolver alias** for this
internal module, so Metro's default resolver cannot resolve it and `expo export
--platform web` aborts before producing output.

This is an incomplete / partially-extracted `expo` install. The canonical fix is
to reinstall a complete `expo` package. As a minimal in-repo workaround that
unblocks the web export, Metro's `resolver.resolveRequest` can short-circuit the
`./Expo.fx` request from `node_modules/expo/src/Expo.ts` to a local empty stub
when the real file is absent on disk.

> **Runtime-risk caveat:** `Expo.fx` wires async-require / React-Server-Component
> shims. For a **non-RSC web export** an empty `module.exports = {}` stub is safe.
> If RSC or native async-require features are later needed, the stub must be
> removed and `expo` reinstalled properly.

### (B) tsc gate — `react-native` has no type declarations

`react-native` in `node_modules` is a **3-line web stub**:
`export const Platform = { OS: "web" }` — with **no type declarations**, and
`@types/react-native` is **not installed**. The project tsconfig extends
`expo/tsconfig.base` (`moduleResolution: "bundler"`, `skipLibCheck: true`,
`strict: true`). `skipLibCheck: true` suppresses errors **inside** `.d.ts` files
but does **NOT** suppress missing-module `TS7016` errors for unresolved imports —
hence 178 `TS7016` across 173 files.

The type-safe canonical fix is to restore react-native's bundled declarations
(reinstall). As a minimal in-repo workaround, an **ambient declaration**
(`declare module 'react-native';`) silences TS7016 project-wide by typing every
`react-native` import as `any`.

> **Trade-off:** this intentionally erases RN type safety for the web-only stub
> runtime. It is acceptable here because the runtime is already a web stub, and
> the canonical type-safe fix (reinstall) is documented.

## Objectives

1. Make `npx tsc --noEmit` pass (0 errors) via a dependency-free ambient
   declaration.
2. Make `npm run build` (expo web export) succeed via a dependency-free Metro
   resolver override + local stub.
3. Document the **root cause** and the **canonical environment fix** (reinstall
   `expo` / `@types/react-native`) so future maintainers can remove the shims.

## Non-Goals

- Do **NOT** run `expo prebuild` or generate native iOS/Android projects.
- Do **NOT** add any new npm dependencies.
- Do **NOT** attempt to fully restore react-native's type definitions in-repo
  (that requires a reinstall) — only the ambient `declare module` shim is added.
- Do **NOT** modify application/source logic; these are environment shims only.

## Approach Summary

- **Fix 1 (tsc):** Add `src/react-native.d.ts` with `declare module 'react-native';`.
  It is within tsconfig `include` (`**/*.ts`, `**/*.tsx`) so the compiler picks it
  up. A `declare module 'react-native-web';` is added only if a file imports it
  directly (grep found none — so it is omitted).
- **Fix 2 (build):** Add `resolver.resolveRequest` to `metro.config.js` that, when
  the request is `./Expo.fx` originating from `node_modules/expo/src/Expo.ts` and
  the real file does not exist on disk, returns the local empty stub
  `scripts/expo-fx-stub.js`; otherwise it delegates to Metro's default resolver.
  Create `scripts/expo-fx-stub.js` (`module.exports = {};`).

## Risks

- The empty `Expo.fx` stub is safe only for non-RSC web exports; flag for removal
  if RSC/native async-require features are introduced.
- The ambient `react-native` declaration removes type safety; flagged for removal
  after a proper reinstall restores declarations.
- Neither change touches app logic, so functional regressions are not expected.
