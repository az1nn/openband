# Proposal — Fix intermittent CI Vitest worker OOM failure (`ci-vitest-worker-fix`)

## Context

GitHub Actions on `cpxlabs/openband` has **never** had a passing `Vitest` step on
`master`. Across the last 100 workflow runs, **89 consecutive `CI` runs failed**, yet
every locally-executed reproduction of the identical suite succeeds:

| Reproduction | Result |
| --- | --- |
| Working tree `npx vitest run` | `# tests 1456` pass, exit 0 |
| Pristine `npm ci` clone | `# tests 1438` pass, exit 0 |
| Pristine + 2-core `taskset -c 0,1` | `# tests 1438` pass, exit 0 |
| Pristine + `CI=true` | `# tests 1438` pass, exit 0 |
| Pristine + piped/non-TTY stdout | `# tests 1438` pass, exit 0 |

Even **docs-only** commits fail CI, so this is not a test-code regression; it is an
environment-specific failure. The failing step is always `Vitest` (`npx vitest run`),
which GitHub Reports "Process completed with exit code 1." The `Backend`, `Type check`,
`Legacy tests`, and `Build` steps are unaffected.

The GitHub Actions log API returns `403` without a token, so the exact stderr cannot be
read; only the public annotations ("Process completed with exit code 1." on the `Vitest`
step) are available.

## Problem

The full test output (`# tests N | N passed`) is produced, then vitest still exits 1.
In vitest, the exit code is forced to `1` (in `cli-api.BK8pd4xc.js`) via the
`hasFailed(modules)` path — a **test module whose state became `!= "passed"`** — *not*
via the `errors`/unhandled path that `dangerouslyIgnoreUnhandledErrors: true` gates.
That means: a fork **worker** producing the output under the GitHub runner's ~2-core /
7 GB cgroup gets **OOM-killed** mid-file. A synthetically-killed or crashed worker marks
its currently-running test file as failed even though prior per-test results already
reported passed. That yields exactly the observed "all tests pass, exit 1" signature.

Locally the suite runs on 16 cores / 15 GB. A worker crash is only reproducibly
reproduced here under artificial memory pressure (`--max-old-space-size=1024`) and is
**flaky**, matching the intermittent CI OOM-kill hypothesis.

## Goals

1. Make the vitest worker pool **deterministic and bounded** so a given runner's
   memory budget (`GITHUB` Action runners) cannot drive a single fork worker past the
   container's heap ceiling and get killed.
2. Keep the existing safety net (`dangerouslyIgnoreUnhandledErrors`, `onUnhandledError`)
   that prevented the `errorsSet → exitCode 1` path, so legitimate assertion failures
   still exit `1` via `hasFailed`.
3. Remove the misleading dead `return false` in `tests/ok-reporter.ts` (its return value
   is discarded by vitest — the real handler is the config-level `onUnhandledError`).
4. Keep all 1456 local tests passing with zero new dependencies and no build-script
   changes.

## Non-Goals

- Not attempting to read the private GH Actions stderr via the log API (requires a
  token not available).
- Not modifying `tests/*.test.*` or their assertions.
- Not touching the `.github/workflows/ci.yml` beyond nothing in this change.
- No new dependencies.