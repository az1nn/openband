# Tasks: Env Build & Types Fixes (Unblock Verification Gates)

> **Status: PROPOSED** — not yet implemented or SHIPPED. Implement per `design.md`.

## Phase 1 — Spec (this change)

- [x] `proposal.md` — context, root cause, objectives, non-goals (written).
- [x] `design.md` — ambient declaration + Metro resolver override design (written).
- [x] `tasks.md` — this file (written).

## Phase 2 — Implement (after approval)

### A. tsc gate — ambient `react-native` declaration
- [ ] Create `src/react-native.d.ts` containing:
  ```ts
  declare module "react-native";
  ```
- [ ] Confirm coverage: tsconfig `include` (`**/*.ts`, `**/*.tsx`) already covers
      `src/react-native.d.ts` (no tsconfig change needed).
- [ ] (Skip) `declare module "react-native-web";` — grep found no direct imports.

### B. build gate — Metro resolver override + stub
- [ ] Create `scripts/expo-fx-stub.js`:
  ```js
  module.exports = {};
  ```
- [ ] Edit `metro.config.js` to add `config.resolver.resolveRequest` that:
  - detects `moduleName === "./Expo.fx"` from `node_modules/expo/src/Expo.ts`
    (via `context.originModulePath`),
  - checks `fs.existsSync` for the real `Expo.fx`,
  - returns `{ filePath: stubPath, type: "sourceFile" }` when missing,
  - otherwise delegates to `context.resolveRequest(context, moduleName, platform)`.
- [ ] Keep `withNativeWind` wrapper intact at `module.exports`.

## Phase 3 — Check (after implementation)

- [ ] `npx tsc --noEmit` → 0 errors (was 178 / 239 total, all TS7016).
- [ ] `npm run build` (`expo export --platform web`) → succeeds.
- [ ] `npx vitest run` → no regression (all pass, incl. 32 audio fix tests).
- [ ] `npm run test:legacy` → pass.
- [ ] `cd backend && npx tsc --noEmit` → pass.
- [ ] `wsl -e bash -lc "cd /home/az1nn/openband && npm run graph:ci"` → CI PASS.

## Phase 4 — Archive

- [ ] Move implemented spec to `openspec/archive/` once all checks pass and
      committed (per OpenSpec SDD loop). Do NOT mark SHIPPED until implemented.

## Remaining

- Canonical environment fix (reinstall `expo` / `@types/react-native`) documented
  in `proposal.md` / `design.md`; removing the shims is a follow-up, out of scope
  for this change.
