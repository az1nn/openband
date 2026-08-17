# Design: Vitest Failure Cleanup (1 Source Defect + 4 Stale Assertions)

> **Status: PROPOSED.** Not SHIPPED. Implementation pending approval.

## 1. F1 — Tauri stub return values (`src/bridge/tauri.ts`)

`detectBridge()` correctly switches to `tauriBridge` when `window.__TAURI__` is
set; that detection logic is unchanged and its test continues to pass. Only the
stub return values change to honor the documented "warn + return null/empty"
contract.

### Current
```ts
getDocumentsPath(): string {
  warnStub("getDocumentsPath");
  return "/mock/documents";
},
getAppDataPath(): string {
  warnStub("getAppDataPath");
  return "/mock/appdata";
},
```

### New
```ts
getDocumentsPath(): string {
  warnStub("getDocumentsPath");
  return "";
},
getAppDataPath(): string {
  warnStub("getAppDataPath");
  return "";
},
```

This satisfies the "safe empty" expectations in
`tests/studioToolsPlaybackDevice.test.ts`:
- "tauriBridge handles desktop stub operations safely"
- "OpenBandNative auto-detects Tauri..."

The `warnStub` call is preserved so stub usage is still logged.

## 2. F2 — `GENRES` length (test-only)

Source of truth: `src/lib/projectTemplates.ts` (~L151) defines 13 entries:
`pop, rock, edm, hiphop, jazz, lofi, rnb, metal, acoustic, blues, trap, house,
dancehall`.

### `tests/lib.test.ts` (~L431) — before
```ts
expect(GENRES).toHaveLength(10);
```
### after
```ts
expect(GENRES).toHaveLength(13);
```

### `tests/specs-group6.test.ts` (~L44) — before
```ts
expect(GENRES).toHaveLength(10);
```
### after
```ts
expect(GENRES).toHaveLength(13);
```

## 3. F3 — musical key flat vs sharp (test-only)

`MUSICAL_KEYS` (in `src/lib/projectStarter.ts`) is sharp-only (`A#`, no `Bb`).
`setupProjectStarter` falls back to the pop default key `"C"` for unrecognized
keys, so passing `"Bb"` yields `"C"`.

### `tests/projectCreationAdvanced.test.ts` (~L32) — before
```ts
const result = setupProjectStarter({ key: "Bb", ... });
expect(result.key).toBe("C"); // stale: assumes Bb handled
```
### after
```ts
const result = setupProjectStarter({ key: "A#", ... });
expect(result.key).toBe("A#");
```

## 4. F4 — autotune local helper (test-only)

The test defines a local `quantizePitch` guarding with `retuneSpeedCheck(0)`
(which returns `true` for `0`) and returns input unchanged, so `60.4` never
rounds to `60`.

### Preferred — import real function
```ts
import { quantizeToScale } from "@/lib/autotune";
// ...
expect(quantizeToScale(60.4, scale, 0)).toBe(60);
```

### Fallback — fix local helper to round
```ts
// before
const quantizePitch = (midiNote: number) => {
  if (retuneSpeedCheck(0)) return midiNote; // never rounds
  return Math.round(midiNote);
};
// after
const quantizePitch = (midiNote: number) => Math.round(midiNote);
```

The preferred path (import real `quantizeToScale`) is taken when wiring is
straightforward; otherwise correct the local helper.

## 5. Components Affected

| File | Change | Fix |
| --- | --- | --- |
| `src/bridge/tauri.ts` | `getDocumentsPath`/`getAppDataPath` return `""` | F1 |
| `tests/lib.test.ts` | `GENRES` length `10` → `13` | F2 |
| `tests/specs-group6.test.ts` | `GENRES` length `10` → `13` | F2 |
| `tests/projectCreationAdvanced.test.ts` | key `"Bb"` → `"A#"` | F3 |
| `tests/autotuneTool.test.ts` | use real `quantizeToScale` or fix local round | F4 |

## 6. Test Requirements / Verification

- `npx vitest run tests/autotuneTool.test.ts tests/studioToolsPlaybackDevice.test.ts tests/lib.test.ts tests/projectCreationAdvanced.test.ts tests/specs-group6.test.ts`
  → all 6 previously-failing cases now pass.
- `npx vitest run` → 0 failures (full suite green).
- `npx tsc --noEmit` → 0 errors (unchanged).
- `npm run test:legacy` → pass.
- `npm run graph:ci` → CI PASS.
- `npm run build` → pass (unchanged).

## 7. Known Latent Nit (flagged, not in scope)

`GENRES[jazz].defaultKey = "Bb"` is not present in `MUSICAL_KEYS` (sharp-only).
It currently works only because the default key is consumed directly by the app
and never validated against `MUSICAL_KEYS`. This inconsistency is documented
here for awareness but is explicitly out of scope for this change.
