# Design — Fix intermittent CI Vitest worker OOM failure (`ci-vitest-worker-fix`)

## Root Cause Analysis

vitest ships with default `pool: "forks"` (separate child process per worker, own
heap — good isolation). It computes workers at runtime:

```
maxWorkers = max(numCpus - 1, 1)   // run mode
```

GitHub `ubuntu-latest` is 2-core (sometimes `os.availableParallelism()` reports more
due to cgroup/hyperthread visibility), so useful workers can range from 1..3. Each
fork worker gets an *unbounded* V8 heap by default (Node limits it to a fraction of
system RAM; with many workers concurrently importing ~30-component JSX test modules,
full-length `OfflineAudioContext` buffers, and `WebAssembly` memory reservations, the
sum can exceed the container's ~7 GB cgroup). When the kernel cgroup OOM-killer reaps a
worker mid-file, vitest marks that file `!= passed` and sets `process.exitCode = 1`
even though all tests already printed pass.

This is intermittent, which is why ASCH race reproductions succeed most of the time,
and why `dangerouslyIgnoreUnhandledErrors` alone (the previous fix) did not help: that
flag gates the *errors* array path, not the *`hasFailed(modules)`* file-state path.

## Approach: Deterministic, Bounded Worker Pool + Per-Worker Heap Cap

Add explicit, deterministic pool options in `vitest.config.ts` so CI and local runs use
the same fixed worker topology, and cap each worker's heap so the container cannot be
exhausted:

Config keys (all valid top-level options in vitest 4.x — v4 removed `poolOptions`,
`minWorkers`, `maxForks`, `singleThread`):

| Key | Value | Rationale |
| --- | --- | --- |
| `pool` | `"forks"` | Explicit; separate-process heap isolation (default already). |
| `maxWorkers` | `2` | Deterministic on every runner; keeps parallelism while bounding concurrent heaps. |
| `maxConcurrency` | `1` | In-file test concurrency reduced to avoid per-file OOM spikes. |
| `execArgv` | `["--max-old-space-size=4096"]` | Hard per-worker V8 heap ceiling (~4 GB), so one worker cannot accumulate past the cgroup. |
| `testTimeout` | `15000` | Generous ceiling so legitimately slow heavy tests don't flake. |
| `hookTimeout` | `20000` | Ceiling for setup/teardown hooks. |

`dangerouslyIgnoreUnhandledErrors: true` and the `onUnhandledError` logger stay as-is
(defense-in-depth against the unrelated `errorsSet → 1` path).

Local runs (16 cores) are capable of more parallel workers, but capping to 2 is still
fast (the suite runs in well under a minute locally with `--maxWorkers=1`) and
guarantees CI and local never diverge on pool topology. If we later need speed on
machines with many cores, `CI=true ? 2 : undefined` can be used; for now a fixed `2`
keeps parity and determinism.

## Removal of Dead Code

`tests/ok-reporter.ts` `onUnhandledError` ends with `return false;`. vitest discards a
custom reporter's `onUnhandledError` return value — only the **config-level**
`onUnhandledError` feeds the StateManager. The `return false` state relevant to the
`errorsSet → exit 1` gate. The current 81ed0ff-style fix already relocated real handling to
the config hook. Remove the `return false;` statement (leave the `console.error` log) so
the reporter no longer falsely signals an `onUnhandledError` the config didn't see.

## Files Touched

1. `vitest.config.ts` — add `pool`, `maxWorkers`, `maxConcurrency`, `execArgv`,
   `testTimeout`, `hookTimeout` to the `test` block.
2. `tests/ok-reporter.ts` — drop the discarded `return false;` in `onUnhandledError`.

## Verification

1. `npx tsc --noEmit` — clean.
2. `npx vitest run` — unchanged locally (1456 pass, exit 0) on 16 cores / 15 GB.
3. `npx vitest run --maxWorkers=2` — passes (exercise the new worker topology).
4. Pristine-clone run (`npm ci` + `taskset -c 0,1` + configured pool) — passes, exit 0.
5. `npm run test:legacy` — 24 pass (unaffected).
6. `npm run build` — succeeds (untouched).
7. `code-review` agent on the staged diff before merge.sub agents