# Design: Pin the Vitest worker pool for deterministic CI results

## Background / verification of validation options

vitest **4.1.10** (from `package-lock.json`) uses the Vitest 4 "pool rework".
Confirmed available top-level `test` keys (research of installed typings + runtime):

| Key | Valid values | Default |
|---|---|---|
| `pool` | `'threads' \| 'forks' \| 'vmThreads' \| 'vmForks' \| 'typescript'` (+ custom) | `'forks'` |
| `fileParallelism` | `boolean` (`false` forces `maxWorkers` to `1`) | `true` |
| `maxWorkers` | `number` or percentage string (e.g. `"50%"`) | `max(numCpus-1, 1)` run mode |
| `maxConcurrency` | `number` (in-file concurrency) | `5` |
| `execArgv` | `string[]` of extra node args, e.g. `['--max-old-space-size=4096']` | `[]` |
| `isolate` | `boolean` | `true` |
| `testTimeout` | `number` (ms) | `5000` |
| `hookTimeout` | `number` (ms) | `10000` |
| `dangerouslyIgnoreUnhandledErrors` | `boolean` | `false` |

**Removed/ignored in v4 (do NOT use):** `poolOptions` (deprecation warning,
sub-options are now top-level), `minWorkers`, `maxForks`, `minForks`, `singleFork`,
`maxThreads`, `minThreads`. Env override is `VITEST_MAX_WORKERS`.

## Chosen configuration

The change keeps things deterministic on the 2-core CI runner while bounding memory:

```ts
test: {
  // (existing keys preserved)
  pool: "forks",                // explicit (already default) — child-process pool
  maxWorkers: 1,                // deterministic: a single fork worker runs the suite
  maxConcurrency: 1,           // serial in-file test execution (avoids heap spikes)
  execArgv: ["--max-old-space-size=4096"], // explicit generous per-worker heap
  isolate: true,
}
```

### Rationale

- `maxWorkers: 1` removes dependence on `availableParallelism()` (which can be 4 on
  GH runners due to hyperthreading even though the cgroup grants 2 vCPU). A single
  fork worker is exactly what a 2-core runner already tends toward, but pinned.
- `execArgv: ["--max-old-space-size=4096"]`: the default heap cap is derived from the
  host's cgroup memory, which on CI can produce an intermittent V8 heap OOM inside
  the heavy DSP/Wasm files. Giving the single worker an explicit 4GB heap headroom
  avoids a default-derived crash. HR corresponding cap stays under CI's ~7GB cgroup
  (4GB worker + main + overhead).
- `maxConcurrency: 1` prevents the in-file `Promise.all`/parallel-heavy audio suites
  from stacking buffers concurrently.
- Keeping `dangerouslyIgnoreUnhandledErrors: true` as defense-in-depth (it gates the
  `errors → exit 1` path). The worker-pool bounds address the `hasFailed(modules)`
  crash path that this flag does NOT cover.

## Files to change

1. `vitest.config.ts` — extend the `test` block with the pool keys above (only adds
   keys; no existing values removed except where redundant).

## Verification

- `npx tsc --noEmit` — must pass (config remains type-valid).
- `npx vitest run` — local must still exit 0 and report `# tests N | N passed`.
- Repeat `npx vitest run` 3× to confirm deterministic/stable exit 0 (no flakiness).
- `npm run test:legacy` — 24 legacy tests still pass.
- `npm run build` — production build succeeds.
- CI trigger: after push, confirm GitHub Actions `Vitest` step concludes success.

## Targeted safety check

- No changes to any test file, `package.json` scripts, or build config.
- `poolOptions`, `minWorkers`, `maxForks`, `singleFork` intentionally avoided as
  invalid-in-v4, to prevent runtime `Warning: ... unknown/ignored option` noise.