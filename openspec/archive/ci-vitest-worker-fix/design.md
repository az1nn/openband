# Design: Install backend dependencies in the CI web job

## Background / root cause

The root cause is NOT memory, wasm, or worker-pool related. It is a **missing
dependency** in the CI environment:

- `tests/feed.test.ts` (line 138) and `tests/telemetry.test.ts` (line 3) do
  `import app from "../backend/src/app"`.
- `backend/src/app.ts` imports `express`, which is installed only in
  `backend/node_modules` (via `backend/package.json` / `backend/package-lock.json`).
- The CI `web` job runs `npm ci` only at the repo root, so `express` is
  unresolvable from the backend source during vitest collection.
- Result: both test files fail at import (zero test cases), yet the custom reporter
  counts only the 1438 executed test cases; vitest's `hasFailed(modules)` still sets
  exit code 1.

Local developer machines pass because they have `backend/node_modules` installed
from normal backend development.

## Chosen fix

Add a step in the `web` job (`.github/workflows/ci.yml`) to install backend
dependencies before running vitest:

```yaml
- name: Install backend dependencies
  working-directory: backend
  run: npm ci

- name: Vitest
  run: npx vitest run
```

The backend `package-lock.json` is committed (92KB), so `npm ci` is
deterministic and fast (backend deps are small: express, cors, multer,
supabase, jsonwebtoken, etc.).

### Why not other options

- **Exclude the two test files from vitest** — reduces coverage; they are real
  backend-integration tests that should run.
- **Add `express` to root `package.json`** — pollutes the frontend dependency graph
  with a backend-only server dependency; incorrect layering.
- **Pool/memory config tweaks** — disproven root cause (verified: the failure is
  purely the missing express import, reproduced cleanly).

## Files to change

1. `.github/workflows/ci.yml` — insert the `Install backend dependencies` step
   between `Type check (frontend)` and `Vitest` in the `web` job.

## Verification

- Local: `cd backend && npm ci` then `npx vitest run` exits 0 with
  `# tests 1438+ | ... passed` (feed/telemetry now run).
- CI: the `web` job's `Vitest` step concludes success after push.
- `npx tsc --noEmit` unaffected (no source changes).
- `npm run test:legacy` and `npm run build` unaffected.

## Targeted safety check

- No changes to `package.json`, `vitest.config.ts`, any test file, or backend code.
- Only the CI workflow gains one step; the backend job is untouched.