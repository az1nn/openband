# Verification — SIGA Operational Orchestration

## Design evidence

- Repository: `az1nn/openband`
- Integration base: `master@e1f75b731ea6e95cffd2b05377890b49fb9c087e`
- Canonical SIGA: `.agents/skills/openband-session-router/SKILL.md`
- Existing concurrency mechanism: idempotent PR/issue session lease with positive `SESSION_KEY` ownership.
- Existing exact-HEAD CI workflow observed: OpenBand CI V2.
- Observed jobs: graph-check, legacy-tests, vitest, security-policy, backend-typecheck, frontend-typecheck, web-build, web-launch-e2e, merge-gate; native build jobs are conditional and were skipped in the inspected unrelated PR.\n- Automated design/policy validation: OpenBand CI V2 run `35920623010`, design HEAD `599c6c9fc147a41625b60e4c99473e4ac94f71f8`, `graph-check` PASS before implementation.

## Pre-freeze implementation evidence

OpenBand CI V2 run `35921405073` passed on implementation HEAD `a77298a5def5c451d3a8fe25216c2eb2003a81cb`:

- graph-check: PASS (includes `sdd:check`, marketing KB checks, `test:graph-sdd` with SIGA regression coverage, and `graph:ci`);
- security-policy: PASS;
- frontend-typecheck: PASS;
- backend-typecheck: PASS;
- vitest: PASS;
- legacy-tests: PASS;
- web-build: PASS;
- web-launch-e2e: PASS;
- merge-gate: PASS;
- android-build/electron-build: NOT_REQUIRED for this non-native PR (conditional jobs skipped).

This evidence validates the implementation before the final Spec Kit reconciliation commit. The final candidate HEAD must be rerun after this documentation-only reconciliation and again as a non-draft candidate if repository merge automation requires that event state.

## Trust-root minimization

A post-implementation audit of the default-branch evidence merger showed that modifying `AGENTS.md`, `scripts/sdd-policy-check.mjs`, or the `test:graph-sdd` package-script wiring automatically derives the T4 trigger `security-sensitive-privileged-workflow`. Those changes were not necessary for SIGA's repository-local orchestration objective, so they were removed. Regression coverage was consolidated into the existing `tests/governance-policy.test.mjs` file, which the unchanged `test:graph-sdd` gate already executes.

Earlier green runs that included the unnecessary trust-root edits are historical evidence only and are **STALE** for the minimized candidate. Final evidence must come from the minimized exact HEAD.

## Required final evidence

| Evidence | State |
|---|---|
| SDD policy | PENDING on minimized candidate |
| SIGA policy regression tests | PENDING on minimized candidate |
| Architecture Graph | PENDING on minimized candidate |
| OpenBand CI V2 exact HEAD | PENDING |
| Review/thread audit | PENDING |
| Mergeability | PENDING on minimized candidate |
| Single canonical SIGA audit | PASS — canonical `.agents/skills/openband-session-router/SKILL.md`, `.qwen` remains delegation-only |
| Central-runtime/Maestri absence audit | PASS — no central runtime path added; references are policy prohibitions/tests only |

Running, queued, stale, skipped-without-justification, flaky or missing required evidence is not PASS.
