# Tasks: Install backend dependencies in the CI web job

## Implementation

- [ ] `.github/workflows/ci.yml` — in the `web` job, insert between the
      `Type check (frontend)` and `Vitest` steps:

      ```yaml
      - name: Install backend dependencies
        working-directory: backend
        run: npm ci
      ```

  - The root `Install dependencies` step (`npm ci` at the repo root) stays as-is.
  - The `backend` job is unchanged.

## Verification

- [ ] Confirm the workflow YAML is valid (`npx actionlint` if available, or manual
      review for indentation/key correctness).
- [ ] Local pristine-clone repro of exact CI:
      1. `git clone` a fresh copy, run `npm ci` at root (do NOT install backend).
      2. `npx vitest run` → currently exits 1 with
         `Failed to resolve import "express" from "backend/src/app.ts"`.
      3. `cd backend && npm ci`, then `npx vitest run` → exits 0, all tests pass.
- [ ] Confirm `cd backend && npm ci` completes cleanly (committed lockfile).
- [ ] After committing + pushing, verify GitHub Actions `web` job `Vitest` step goes
      green (via the public Actions API: run conclusion == `success`).

## Docs / spec sync

- [ ] Grep for references to the old "worker pool pin" rationale
      (`docs/pending-implementations.md`, `docs/unimplemented-specs.md`,
      `docs/features-implementation.md`) and update them to the confirmed root cause
      (missing backend deps in the CI web job). Remove any stale claim that the
      vitest pool was the fix.

## Notes

- The speculative pool/memory hypothesis was disproven by clean reproduction; do
  not re-introduce `pool`/`maxWorkers`/`execArgv` changes to `vitest.config.ts`.