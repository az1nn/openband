# Tasks — Fix intermittent CI Vitest worker OOM failure (`ci-vitest-worker-fix`)

> Follow the OpenSpec SDD loop: spec first (commit `spec:`), then implement, verify,
> then final commit.

## Phase A — Spec commit (done when the three spec files are committed)

- [x] `openspec/changes/ci-vitest-worker-fix/proposal.md`
- [x] `openspec/changes/ci-vitest-worker-fix/design.md`
- [x] `openspec/changes/ci-vitest-worker-fix/tasks.md`

## Phase B — Implement

- [ ] `vitest.config.ts`: add to the `test` block
  - `pool: "forks"`
  - `maxWorkers: 2`
  - `maxConcurrency: 1`
  - `execArgv: ["--max-old-space-size=4096"]`
  - `testTimeout: 15000`
  - `hookTimeout: 20000`
  - Keep `dangerouslyIgnoreUnhandledErrors: true` and `onUnhandledError` unchanged.
- [ ] `tests/ok-reporter.ts`: remove the discarded `return false;` from
      `onUnhandledError` (keep the `console.error` line).

## Phase C — Verify (run in order)

1. `npx tsc --noEmit` — zero errors.
2. `npx vitest run` — all tests pass (1456 locally), exit 0.
3. `npx vitest run --maxWorkers=2` — passes under the configured worker topology.
4. Pristine-clone check: `npm ci` in a temp clone, `taskset -c 0,1 npx vitest run`
   — passes, exit 0.
5. `npm run test:legacy` — 24 tests pass.
6. `npm run build` — succeeds.
7. Run the `code-review` subagent over the staged diff; fix anything it flags.

## Phase D — Commit & push

- [ ] Commit implementation (type `fix:`) with a bullet list of the specific changes.
- [ ] Push to `master` so the `CI` workflow runs the new pool config.
- [ ] Poll `https://api.github.com/repos/cpxlabs/openband/actions/runs?per_page=1` for
      the next run's conclusion to confirm the Vitest step is green (this is the
      acceptance test for this change).
- [ ] If still red, inspect the new run's annotation and iterate (the annotation for the
      Vitest step is public).
- [ ] Update `docs/features-implementation.md` if any doc references the vitest config.
