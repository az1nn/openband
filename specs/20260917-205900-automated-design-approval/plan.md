# Implementation Plan: Automated Design Approval

## Strategy

**ADR: NOT REQUIRED** — this changes repository governance/evidence policy without introducing a new product/runtime architecture boundary.

1. Amend the Constitution and live agent policy so Spec Kit + risk-derived evidence, not a generic manual Design Gate, is the engineering approval boundary.
2. Update session/ask/handoff guidance so agents stop only for real human decisions or external authorization.
3. Remove functional `openband-design-gate` parsing and validation from the privileged evaluator.
4. Preserve a one-release inert legacy marker in the workflow text only so the currently deployed T4 evaluator can validate this self-migration without a fail-open bootstrap.
5. Update SDD/security/governance tests and recovery documentation to assert the new invariants.
6. Keep exact-HEAD/base freshness, same-repo checks, tier escalation, declared `requiredChecks`, T4 trust-root review, review blockers, and fail-closed evidence semantics unchanged.

## Risk

This is T4 because it changes privileged merge policy and repository governance. The migration must pass the pre-change T4 evaluator and the candidate's own CI/security tests.

## Adversarial verification

The T4 review must actively try to prove a fail-open path exists: missing/undeclared derived risk triggers, absent Spec Kit artifacts, stale or foreign HEADs, missing required jobs, blocking reviews, candidate-controlled privileged execution, or a hidden dependency on manual PR comments must all remain blocked.

Rollback/recovery: disable the privileged evidence-merge workflow or revert this governance PR using `docs/operations/merge-automation-recovery.md` if the new policy admits an unverified merge or blocks valid evidence-driven work.

## Verification

- `npm run sdd:check`
- `npm run security:policy`
- `npm run test:graph-sdd`
- frontend/backend typechecks
- Vitest and legacy tests
- Web build and launch E2E
- merge-gate
- privileged T4 post-CI evidence evaluation from current `master`

## Non-goals

- No weakening of evidence requirements.
- No direct pushes to `master`.
- No removal of human approval for destructive runtime actions or unresolved product decisions.
- No rewrite of historical specs.
