# Proposal: Install backend dependencies in the CI web job

## Context

The `cpxlabs/openband` repository runs a GitHub Actions workflow whose `web` job
`Vitest` step has **never passed** on `master` — 89 consecutive failures across the
last 100 runs, including documentation-only commits that touch no test code. The
step runs `npx vitest run` (root-level `npm ci` only) and exits 1 while the custom
reporter (`tests/ok-reporter.ts`) prints `# tests 1438 | 1438 passed`.

## Root cause (confirmed)

`tests/feed.test.ts` and `tests/telemetry.test.ts` import the backend Express app:

```
tests/feed.test.ts:138      import app from "../backend/src/app";
tests/telemetry.test.ts:3   import app from "../backend/src/app";
```

`backend/src/app.ts` does `import express from "express"`. `express` is a dependency
of the **backend** package (`backend/package.json`), installed into
`backend/node_modules` — which the CI `web` job **never installs**: it only runs
`npm ci` at the repo root (root `node_modules` does not contain `express`).

An authoritative reproduction proved the cause:

| Scenario | Backend deps installed? | `npx vitest run` exit |
|---|---|---|
| A: root-only `npm ci` (exact CI conditions) | No | **1** — `Failed to resolve import "express" from "backend/src/app.ts"` |
| B: root + `cd backend && npm ci` | Yes | **0** — all pass |

### Why the reporter shows "all passed" while CI exits 1

The two test files fail at **import/collection time** (express cannot be resolved),
so they produce **zero test cases**. The custom reporter counts only executed test
cases (1438 passing) and never reports the two failed *suites*. vitest's internal
`hasFailed(modules)` check (a test file whose state is `!= "passed"`) then sets
`process.exitCode = 1`. This path is NOT gated by `dangerouslyIgnoreUnhandledErrors`
(which only affects the `errors` → exit 1 path), which is why earlier "fix" commits
(such as `81ed0ff`) did not turn CI green.

## Objectives

1. Make the CI `web` job's `Vitest` step green.
2. Ensure `tests/feed.test.ts` and `tests/telemetry.test.ts` can resolve their
   backend imports on CI, so they actually execute (1438 → 1438+ tests).
3. No source-code changes; no test changes; no dependency changes to `package.json`.

## Non-Objectives

- Not changing any test files, `package.json`, `vitest.config.ts`, or the backend.
- Not disabling or excluding the two backend-integration tests.