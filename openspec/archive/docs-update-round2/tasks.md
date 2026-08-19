# Tasks: Documentation Sync After Round-2 Hardening

- [ ] Compute actual vitest test-file count via `ls tests/*.test.ts tests/**/*.test.ts | wc -l`
      (run inside WSL) and note the number.
- [ ] `README.md`:
  - [ ] L21 `Vitest (1479 tests)` → `Vitest (1650 tests)`.
  - [ ] Ensure `npm run tsc`, `npx tsc --noEmit`, `npx vitest run`, `npm run test:legacy`,
        `npm run graph:ci`, `npm run build` are listed in Scripts.
  - [ ] Add `## Verification` matrix block (6 steps) with WSL run note.
  - [ ] Scope Playwright/E2E as optional.
- [ ] `AGENTS.md`:
  - [ ] Add bullet in Known Issues about the 5 `regression-round2-*` suites,
        `futureRoadmap.test.ts` vitest conversion, `backend-routes.test.ts` exclusion.
  - [ ] Architecture totals: `1479` → `1650`; update `83 test files` to actual count; keep legacy `24`.
- [ ] `docs/features-analysis.md`: `1479` → `1650`; fix `83 files` reference.
- [ ] `docs/testing-mocks.md`: fix stale `1479` / `83` references.
- [ ] `docs/HY3-HANDOFF.md`: `1479` → `1650` (L12, L33, L176).
- [ ] `ROADMAP.md`: add "Superseded by docs/roadmap.md" header note.
- [ ] `docs/features-implementation.md`: add one-line hardening note (commit `0f3a45b` + regression suites).
- [ ] Verify: `grep -rn "1479" README.md AGENTS.md docs/features-analysis.md docs/testing-mocks.md docs/HY3-HANDOFF.md`
      returns no matches.
- [ ] Commit spec files first (before edits), then implement, then archive + final commit + push.
