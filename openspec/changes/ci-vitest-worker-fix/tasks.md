# Tasks: Pin the Vitest worker pool for deterministic CI results

## Implementation

- [ ] `vitest.config.ts` — add `const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";` and, within the `test` block, spread the bounded pool only when `isCI`:
  - `pool: "forks"`, `maxWorkers: 1`, `maxConcurrency: 1`,
    `execArgv: ["--max-old-space-size=4096"]`, `isolate: true`
  - local (non-CI) runs keep the default parallel pool
  - preserve all existing keys (`globals`, `environment`, `setupFiles`, `include`,
    `exclude`, `server.deps.inline`, `reporters`, `dangerouslyIgnoreUnhandledErrors`,
    `onUnhandledError`) unchanged.
- [ ] Confirm `tests/ok-reporter.ts` has no invalid hook (`onUnhandledRejection`
  does not exist as a vitest reporter hook; keep only valid reporter methods;
  reporter `onUnhandledError` is fine to keep logging, return value is ignored).

## Verification

- [ ] `npx tsc --noEmit` — exit 0, no type errors.
- [ ] `npx vitest run` — exit 0, reports `# tests N | N passed` (1438 base).
- [ ] Repeat `npx vitest run` 2 more times — stable exit 0 (deterministic).
- [ ] `npm run test:legacy` — exit 0 (24 legacy tests).
- [ ] `npm run build` — succeeds.
- [ ] If CI access is available: confirm the `Vitest` step goes green after push.
     Otherwise, note the local-only verification and the bounded-pool rationale for
     a follow-up CI confirmation.

## Docs / spec sync

- [ ] Update `docs/pending-implementations.md` (if it references the CI vitest fix)
  to reflect the pool pin + memory bounds as the implemented approach.
- [ ] Update `docs/unimplemented-specs.md` if it lists the CI-vitest item, moving it
  to implemented/pending as appropriate.

## Follow-up (only if locally reproducible after the above)

- [ ] If exit-1 still reproduces deterministically, capture the exact crash file and
  inspect its heavy allocations (unguarded `OfflineAudioContext`/`WebAssembly`) and
  add targeted guards. Otherwise no test-file changes are needed.