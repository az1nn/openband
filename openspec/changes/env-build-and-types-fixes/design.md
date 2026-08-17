# Design: Env Build & Types Fixes (Unblock Verification Gates)

> **Status: PROPOSED.** Not yet SHIPPED. Implementation tasks are in `tasks.md`.

## 1. Fix 1 — tsc gate (`TS7016: Could not find a declaration file for module 'react-native'`)

### Root cause
`node_modules/react-native` is a 3-line web stub with no `.d.ts`, and
`@types/react-native` is not installed. tsconfig extends `expo/tsconfig.base`
(`skipLibCheck: true`, `strict: true`, `moduleResolution: "bundler"`).
`skipLibCheck` does **not** suppress missing-module `TS7016`, so 178 errors are
emitted across 173 files.

### New file: `src/react-native.d.ts`

```ts
declare module "react-native";
```

This ambient declaration makes every `import ... from "react-native"` resolve to
`any`, silencing all `TS7016` project-wide.

**Coverage check:** `tsconfig.json` `include` contains `"**/*.ts"` and
`"**/*.tsx"`, so `src/react-native.d.ts` is picked up by the compiler
(`backend`, `api`, `node_modules`, `wasm` are excluded — none relevant here).

**Trade-off:** RN type safety is lost for the web-only stub runtime. Acceptable
because the runtime is already a web stub; the canonical type-safe fix (reinstall
to restore bundled declarations) is documented in the proposal and as a removal
item.

**`react-native-web`:** a grep for `from "react-native-web"` returned no matches,
so no ambient declaration for it is added. If a direct import is added later,
append `declare module "react-native-web";` to the same file.

## 2. Fix 2 — build gate (`Unable to resolve module ./Expo.fx`)

### Root cause
`node_modules/expo/src/Expo.ts` imports `./Expo.fx`, but the file is absent from
`node_modules/expo` (only `.d.ts` exist). Default Metro config has no resolver
alias, so `expo export --platform web` fails.

### New: `scripts/expo-fx-stub.js`

```js
module.exports = {};
```

### Edit: `metro.config.js` resolver override

`metro.config.js` is a **config** file; per `AGENTS.md` it is normally off-limits,
but the task explicitly requires modifying it to unblock the web export, so the
change is in-scope. The override short-circuits only the broken internal request
and delegates everything else.

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const fs = require("fs");
const path = require("path");

const config = getDefaultConfig(__dirname);

const FX_STUB = path.join(__dirname, "scripts", "expo-fx-stub.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isExpoSource = context.originModulePath.includes(
    path.join("node_modules", "expo", "src", "Expo.ts")
  );
  if (moduleName === "./Expo.fx" && isExpoSource) {
    const realFx = path.join(path.dirname(context.originModulePath), "Expo.fx");
    if (!fs.existsSync(realFx)) {
      return { filePath: FX_STUB, type: "sourceFile" };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
```

**Behavior:**
- `context.originModulePath` identifies the requesting module; we restrict the
  override to requests from `node_modules/expo/src/Expo.ts`.
- `moduleName === "./Expo.fx"` targets exactly the broken request.
- `fs.existsSync` confirms the real `Expo.fx` is missing, so the stub is only
  used when actually needed (if a complete `expo` install is later restored, the
  real file wins and the stub is bypassed automatically).
- Return `{ filePath: stubPath, type: "sourceFile" }` to satisfy Metro's
  `ResolveRequest` contract; otherwise delegate to `context.resolveRequest`.

**Runtime-risk caveat:** `Expo.fx` wires async-require / RSC shims. An empty stub
is safe for non-RSC web exports. Remove this override after reinstalling a
complete `expo` package.

## 3. File-Change Table

| File | Change | Type |
| --- | --- | --- |
| `src/react-native.d.ts` | new — `declare module "react-native";` | new |
| `metro.config.js` | edit — add `resolver.resolveRequest` Expo.fx stub fallback | edit |
| `scripts/expo-fx-stub.js` | new — `module.exports = {};` | new |

## 4. Verification

1. `npx tsc --noEmit` → **0 errors** (was 178 / 239 total, all TS7016).
2. `npm run build` (`expo export --platform web`) → succeeds.
3. `npx vitest run` → no regression (all pass, incl. 32 audio fix tests).
4. `npm run test:legacy` → pass.
5. `cd backend && npx tsc --noEmit` → pass.
6. `wsl -e bash -lc "cd /home/az1nn/openband && npm run graph:ci"` → CI PASS.

## 5. Canonical (Environment) Fix — documented alternative

- **tsc:** reinstall to restore `react-native`'s bundled declarations (or add
  `@types/react-native`), then delete `src/react-native.d.ts`.
- **build:** reinstall a complete `expo` package (so `Expo.fx` exists), then
  remove the `metro.config.js` resolver override and `scripts/expo-fx-stub.js`.
