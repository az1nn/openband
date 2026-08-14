# Repo Hardening — Tasks

## Security (MUST)
- [ ] S1 `backend/src/middleware/tierGuard.ts`: derive tier from `req.userTokenData.tier` (JWT), not `x-user-tier` header; update `requireFeature` in `app.ts`.
- [ ] S2 `backend/src/app.ts`: mount `requireAuth` on `/api/extract`, `/api/master/bounce`, `/api/export/*`, `/api/generate-midi`.
- [ ] S3 `backend/src/middleware/sessionBlacklist.ts`: use SHA-256 of full token instead of `substring(0,16)`.
- [ ] S4 `electron/main.js`: enable `sandbox: true` (or document exception).

## Correctness bugs
- [ ] B1 `backend/src/services/queue.ts`: write silent WAVs to mock stem URLs (or remove queue).
- [ ] B2 `backend/src/routes/master.ts`: echo real input metadata; don't claim transcoding.
- [ ] B3 `backend/src/routes/extract.ts`: derive `duration` from the uploaded file.
- [ ] B4 `backend/src/routes/presence.ts`: set/update `lastSeen` so stale cleanup fires.
- [ ] B5 `app/_layout.tsx`: replace `window.electronAPI` with bridge `isDesktop()` flag.
- [ ] B6 `app/tabs/_layout.tsx`: remove duplicate Feed tab (`index` vs `feed`).
- [ ] B7 `src/lib/hardwareIO.ts`: remove no-op `patchState` assignment; split line 80.
- [ ] B8 `src/lib/midiLearn.ts`↔`src/lib/mcu.ts`: extract shared module to break cycle.

## Graph toolchain
- [ ] G1 `graph/specs.mjs`: tighten `PATH_RE` to known roots + real extensions (kill spurious `OB-GRAPH-003`).
- [ ] G2 `graph/validate.mjs`: add `scripts/` to `OB-GRAPH-004` entry-point allowlist.
- [ ] G3 `graph/core.mjs`+`builder.mjs`: remove unused `createGraphFrom`/`loadGraph` (or wire `load`).

## Conventions
- [ ] C1 `src/components/Toast.tsx`,`Skeleton.tsx`: `StyleSheet.create` → `className`.
- [ ] C2 `src/components/Sidebar.tsx`: static `import` for logo asset (drop `require()`).
- [ ] C3 `app/explorer.tsx`: migrate to `loadThree()` CDN pattern.
- [ ] C4 `app/mastering/index.tsx`: replace `useState(()=>...)[0]` with `useMemo`/`const`.
- [ ] C5 `src/bridge/tauri.ts`: `writeFile` throws `"not implemented"` for parity.
- [ ] C6 (optional): remove inline comments in 3D screens + lib files.

## Docs / config
- [ ] D1 AGENTS.md + README.md: recount components (~81) and tests (~1536) / files (83).
- [ ] D2 docs/features-analysis.md, testing-mocks.md, HY3-HANDOFF.md: fix test counts + SDK 57.
- [ ] D3 openspec specs/archive: correct dead-path citations (api/auth→backend/src/routes, midiMcu→mcu, app/build.gradle→android/, Mastering→MasteringSuite).
- [ ] K1 package.json: pin `typescript` `^5.x`; add `tsx` devDep (or reuse backend).
- [ ] K2 vitest.config.ts: remove `dangerouslyIgnoreUnhandledErrors`.
- [ ] K3 backend/tsconfig.json: add `noUnusedLocals`/`noUnusedParameters`.

## Tests
- [ ] T1 backend route tests (extract/master/presence) with auth rejection + happy path.
- [ ] T2 `projectEncryption` round-trip/tamper + `timeStretchVocoded` smoke (or `loadThree` fallback) tests.
- [ ] T3 regression test: `graph:ci` zero `OB-GRAPH-001/002` on live repo.

## Verification (before commit)
- [ ] `node backend` route checks: protected routes reject anonymous; tier from JWT.
- [ ] `node graph/cli.mjs ci` → zero `OB-GRAPH-001/002/004/005` errors (warnings allowed).
- [ ] `npm run test:legacy` + `npm run build` succeed without missing deps.
- [ ] `node --test` / vitest reflect updated counts.
- [ ] Code review via `code-review` subagent; commit; archive spec to `openspec/archive/repo-hardening/`.
