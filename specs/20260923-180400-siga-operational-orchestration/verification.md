# Verification — SIGA Operational Orchestration

## Design evidence

- Repository: `az1nn/openband`
- Integration base: `master@e1f75b731ea6e95cffd2b05377890b49fb9c087e`
- Canonical SIGA: `.agents/skills/openband-session-router/SKILL.md`
- Existing concurrency mechanism: idempotent PR/issue session lease with positive `SESSION_KEY` ownership.
- Existing exact-HEAD CI workflow observed: OpenBand CI V2.
- Observed jobs: graph-check, legacy-tests, vitest, security-policy, backend-typecheck, frontend-typecheck, web-build, web-launch-e2e, merge-gate; native build jobs are conditional and were skipped in the inspected unrelated PR.

## Required final evidence

| Evidence | State |
|---|---|
| SDD policy | PENDING |
| SIGA policy regression tests | PENDING |
| Architecture Graph | PENDING |
| OpenBand CI V2 exact HEAD | PENDING |
| Review/thread audit | PENDING |
| Mergeability | PENDING |
| Single canonical SIGA audit | PENDING |
| Central-runtime/Maestri absence audit | PENDING |

Running, queued, stale, skipped-without-justification, flaky or missing required evidence is not PASS.
