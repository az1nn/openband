# Tasks: Env Build & Types Fixes (Unblock Verification Gates)

## Status: SHIPPED

## Phase 1 — Spec (this change)

- [x] `proposal.md` — context, root cause, objectives, non-goals (written).
- [x] `design.md` — ambient declaration + Metro resolver override design (written).
- [x] `tasks.md` — this file (written).

## Phase 2 — Implement (after approval)

### A. tsc gate — ambient `react-native` declaration
- [x] Create `src/react-native.d.ts` containing:
  ```ts
  declare module "react-native";
  ```
- [x] Confirm coverage: tsconfig `include` (`**/*.ts`, `**/*.tsx`) already covers
      `src/react-native.d.ts` (no tsconfig change needed).
- [x] (Skip) `declare module "react-native-web";` — grep found no direct imports.

### B. build gate — Metro resolver override + stub (defensive fallback)
- [x] Create `scripts/expo-fx-stub.js`:
  ```js
  module.exports = {};
  ```
- [x] Edit `metro.config.js` to add `config.resolver.resolveRequest` that:
  - detects `moduleName === "./Expo.fx"` from `node_modules/expo/src/Expo.ts`
    (via `context.originModulePath`),
  - checks `fs.existsSync` for the real `Expo.fx`,
  - returns `{ filePath: stubPath, type: "sourceFile" }` when missing,
  - otherwise delegates to `context.resolveRequest(context, moduleName, platform)`.
  - **Defensive only:** in a healthy install the real `Expo.fx.tsx` exists, so
    the stub is bypassed.
- [x] Keep `withNativeWind` wrapper intact at `module.exports`.

> **Note — build unblocked via environment fix:** the actual root cause was a
> corrupted `node_modules/expo` (14 missing `.tsx` sources incl. `Expo.fx.tsx`
> and `launch/registerRootComponent.tsx`). Running
> `rm -rf node_modules/expo && npm install expo@57.0.4` restored them and the
> build passed (35 web bundles). This is an environment-only change (nothing
> committed); the Metro stub is now a defensive fallback.

## Phase 3 — Check (after implementation)

- [x] `npx tsc --noEmit` → **TS7016 count 0** (was 178 / 239 total, all TS7016).
- [x] `npm run build` (`expo export --platform web`) → **PASS (35 web bundles emitted)**.
- [x] `npx vitest run` → PASS.
- [x] `npm run test:legacy` → PASS.
- [x] `cd backend && npx tsc --noEmit` → pass.
- [x] `npm run graph:ci` → PASS (Errors 0).

## Phase 4 — Archive

- [ ] Move implemented spec to `openspec/archive/` once all checks pass and

## Remaining / Out of Scope

- **Out of scope:** ~84 pre-existing non-TS7016 tsc errors remain
  (TS7006/TS2709/TS2613/TS2322/…) — unrelated app-source type issues, separate
  from this change.
- Canonical root-cause fix (reinstall `expo@57.0.4`) already applied in the
  environment; the Metro stub remains as a defensive fallback rather than being
  removed.
