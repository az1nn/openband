# Proposal: Pin the Vitest worker pool for deterministic CI results

## Context

The `cpxlabs/openband` repository runs a GitHub Actions workflow (`web` job) whose
`Vitest` step has **never passed** on `master` — 89 consecutive failures across the
last 100 runs, including documentation-only commits that touch no test code. The step
is `npx vitest run` (default config, no pool tuning). All 1438–1456 tests report as
passing via the custom `tests/ok-reporter.ts`, yet vitest exits with code 1.

Local reproduction of the identical suite exits 0 in every faithful scenario:

- pristine `npm ci` clone (1438 tests)
- 2-core CPU pinning via `taskset -c 0,1` (mirrors GH runner)
- `CI=true`
- piped (non-TTY) stdout
- custom vs default reporter

The only local runs that ever produced exit 1 did so under an **artificial heap cap**
(`NODE_OPTIONS="--max-old-space-size=1024"`), and were **flaky/intermittent**, more
consistent with an artifact of the artificial cap than the runner's real memory
profile.

## Problem

The exact CI failure cannot be reproduced locally, and CI logs are not accessible
(hidden runner, 403 on the log API without a token). The leading technical hypothesis
is a **fork-worker heap crash under GH-hosted runner memory constraints**:

- vitest's default pool is `forks`; on a 2-vCPU runner the default
  `maxWorkers = max(numCpus - 1, 1) = 1`, so a single child process runs the whole
  1438+ file suite.
- That single worker runs with Node's **default heap cap** (settled from the host's
  ~7GB cgroup). Heavy DSP/audio/Wasm test files (components suites import ~30
  components each; playback/audio tests allocate full-length
  `OfflineAudioContext`/`AudioBuffer`s) can intermittently spike the heap.
- When a worker hits the V8 heap limit it throws (or is killed) **mid-file**, so the
  test file's overall state becomes `!= "passed"` — vitest's `hasFailed(modules)`
  path (`cli-api...js:12606`) then sets `process.exitCode = 1` regardless of the
  already-passed per-test results.
- ` dangerouslyIgnoreUnhandledErrors: true` does NOT gate this path; it only gates
  the `errors` → exit 1 path (`cli-api...js:13914`), which is why the earlier
  `81ed0ff` fix did not turn CI green.

Because the failure depends on the runner's memory profile, the reliable fix is to
make the vitest worker pool **deterministic and bounded**: cap the number of workers
and give each worker an explicit, generous heap so it cannot hit a default-derived
cap while running the heavy DSP/Wasm files.

## Objectives

1. Make CI vitest exits deterministic and green on the CI's constrained 2-core/7GB
   runner.
2. Set an explicit, bounded worker pool so file-parallelism behavior does not depend
   on `availableParallelism()` on the runner.
3. Give each fork worker an explicit generous heap cap so heavy audio/Wasm test files
   cannot crash a worker mid-suite.
4. Keep the full test surface green locally (1438 base / 1456 with local `.env`).
5. No new dependencies; no changes to build scripts or the test suite's logic.

## Non-Objectives

- Not fixing the (uncertain) exact root cause: the goal is a deterministic, bounded
  pool so CI does not OOM, not to chase a specific test file.
- Not disabling tests or `dangerouslyIgnoreUnhandledErrors` (already present, keep as
  defense-in-depth).