# Repo Hardening — Design

Implementation notes per triage group. All edits stay within existing modules; no
new npm dependencies; no static `from "three"` (use `loadThree()`); frontend never
touches desktop internals (use `@bridge`/`OpenBandNative`).

## Security (MUST)

### S1 — tier from JWT, not header (`backend/src/middleware/tierGuard.ts`)
- `getTierFromRequest(req)` → read `req.userTokenData?.tier` (set by auth
  middleware) instead of `req.headers["x-user-tier"]`.
- Keep header as a non-authoritative hint only if needed for logging.
- `requireFeature` in `app.ts` must use the JWT-derived tier.

### S2 — requireAuth on protected routes (`backend/src/app.ts`)
- Mount `requireAuth` (or apply per-route) on `/api/extract`, `/api/master/bounce`,
  `/api/export/*`, `/api/generate-midi`. Keep `/api/health`, `/api/stems/:file`
  (or gate stems too) as appropriate. Public routes (login, presign) stay open.

### S3 — session blacklist hash (`backend/src/middleware/sessionBlacklist.ts`)
- Replace `token.substring(0,16)` with `crypto.createHash("sha256").update(token).digest("hex")`
  (Node `crypto`, already available). Update both write and read paths.

### S4 — electron sandbox (`electron/main.js`)
- Set `sandbox: true` (or document the disabling reason in a comment if a native
  module requires it).

## Correctness bugs

### B1 — queue mock stems (`backend/src/services/queue.ts`)
- Either write placeholder WAV bytes to the returned `/api/stems/mock_<id>_*.wav`
  paths (so status/download 200s), or remove the queue + its routes if unused.
  Prefer writing silent WAVs mirroring `mock.ts`.

### B2 — master bounce (`backend/src/routes/master.ts`)
- Only report `bitDepth`/`sampleRate`/`format` actually present in the input; do not
  claim transcoding. If real transcoding is desired, add later; for now copy bytes
  and echo real input metadata.

### B3 — extract duration (`backend/src/routes/extract.ts`)
- Derive duration from the uploaded file (probe header or pass through from the
  demucs/mock service) instead of hardcoded `30`.

### B4 — presence lastSeen (`backend/src/routes/presence.ts`)
- Set `data.lastSeen = Date.now()` on subscribe/cursor/keepalive; stale-timeout
  cleanup then works.

### B5 — desktop leak (`app/_layout.tsx`)
- Replace `window.electronAPI` check with a bridge flag (e.g. `OpenBandNative.isDesktop()`
  or an `isElectron` exported from `src/bridge/index.ts`).

### B6 — duplicate tab (`app/tabs/_layout.tsx`)
- Remove the `feed` screen (keep `index`) OR remove `index` and rename `feed` to the
  default — Feed must mount once.

### B7 — hardwareIO (`src/lib/hardwareIO.ts`)
- Remove the no-op `patchState = {...patchState, routes: patchState.routes}`; if state
  mutation is intended, use the real store/notify path. Split line 80 into two lines.

### B8 — midiLearn↔mcu cycle
- Extract the shared type/util both import into a third module (e.g. `src/lib/midiShared.ts`)
  so neither imports the other. Verified by `graph:ci` showing zero `OB-GRAPH-002`.

## Graph toolchain (G1–G3)

### G1 — `graph/specs.mjs` PATH_RE
- Tighten regex so a `.` is only allowed as part of a file extension: reject
  trailing `.`, method chains (`foo.bar.baz` where `baz` isn't a known ext), and
  build-artifact paths (`app/_expo/...`, `tests/stories.`). Use an allowlist of
  extensions (`.ts/.tsx/.js/.jsx/.mjs/.json`) and require the path to start with a
  known root (`app|src|backend|api|tests|electron|stories|scripts`).

### G2 — `graph/validate.mjs` OB-GRAPH-004 allowlist
- Add `node.id.startsWith("scripts/")` (or check against `package.json` `scripts`
  targets) so entry scripts aren't flagged orphaned.

### G3 — dead exports
- Remove `createGraphFrom` (unused) or wire `loadGraph`/`createGraphFrom` into
  `cli.mjs` (e.g. a `load` subcommand) if useful. Prefer removal to avoid dead code.

## Conventions (C1–C5)

- C1: convert `Toast.tsx`/`Skeleton.tsx` `StyleSheet.create` to `className` + global.css.
- C2: `Sidebar.tsx` use static `import` for the logo asset.
- C3: `explorer.tsx` migrate to `loadThree()` CDN pattern (or document iframe exception).
- C4: `mastering/index.tsx` replace `useState(()=>...)[0]` with `useMemo`/`const`.
- C5: `bridge/tauri.ts` make `writeFile` throw `"not implemented"` for parity with `readFile`.
- C6: selective comment removal in 3D screens + lib (defer if too large).

## Docs / config (D1–D3, K1–K3)

- D1: recount `src/components/index.ts` exports and `node --test`/vitest totals; update
  AGENTS.md + README.md.
- D2: fix `features-analysis.md`, `testing-mocks.md`, `HY3-HANDOFF.md` counts/SDK.
- D3: correct openspec dead-path citations (`api/auth/*`→`backend/src/routes/*`,
  `midiMcu.ts`→`mcu.ts`, `app/build.gradle`→`android/...`, `Mastering`→`MasteringSuite`).
- K1: pin `typescript` to `^5.x`; add `tsx` to root devDeps (or reuse backend's).
- K2: remove `dangerouslyIgnoreUnhandledErrors` from `vitest.config.ts` (or fail run).
- K3: add `noUnusedLocals`/`noUnusedParameters` to `backend/tsconfig.json`.

## Tests (T1–T2)

- T1: add supertest coverage for `/api/extract`, `/api/master/bounce`, `/api/presence`
  (mock demucs), asserting auth rejection + happy path.
- T2: add `projectEncryption` round-trip + tamper tests and `timeStretchVocoded`
  smoke test (or at minimum `loadThree` fallback-chain test).
- T3: add a regression test that `graph:ci` produces zero `OB-GRAPH-001/002` errors
  on the live repo (or a pinned fixture).
