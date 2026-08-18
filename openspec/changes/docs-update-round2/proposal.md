# Proposal: Documentation Sync After Round-2 Hardening

## Context
Round-2 full-repo code review hardening (`0f3a45b`) and the regression test suites
(`regression-round2-{audio,state,ui,lib,backend}.test.ts`, committed `f521e79`) landed on
`agent/v8-round-a-governance`. The current docs still reference a stale vitest count of **1479**
(actual: **1650**) and a stale test-file count, omit the consolidated **verification matrix**,
and never mention the new regression suites, the `tests/futureRoadmap.test.ts` vitest conversion,
or the `tests/backend-routes.test.ts` node:test exclusion. These docs must be synced before the
branch is merged so the README/AGENTS reflect the true, reproducible workflow.

This change is **documentation-only** — no source, test, or config logic changes.

## Objectives
- Correct the vitest total (1479 → 1650) and legacy total (24) across all docs.
- Add a consolidated **Verification Matrix** section to README and AGENTS so the six-step
  gate (`tsc` → backend `tsc` → `vitest` → `test:legacy` → `graph:ci` → `build`) is unambiguous.
- Record the regression suites + test-infra changes in AGENTS.md Known Issues so future
  sessions know `backend-routes.test.ts` is a node:test script excluded from vitest.
- Mark the legacy `ROADMAP.md` as superseded by `docs/roadmap.md` to avoid confusion.
- Keep `docs/features-implementation.md` as-is (hardening added no new features) with a brief
  hardening note.

## Out of Scope
- No source/test/config edits.
- No new features or refactors.
- `docs/roadmap.md` content is current and untouched.
