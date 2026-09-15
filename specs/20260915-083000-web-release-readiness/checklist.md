# Checklist — Web Release Readiness

## Design completeness

- [x] Issue #51 and parent #46 are explicit.
- [x] Tier is T2 with T3/T4 escalation boundaries.
- [x] #47–#50 feature dependencies are represented in `openband.json`.
- [x] Public Web root behavior is specified without changing native entry behavior.
- [x] The root auth shell allows only Web `/` publicly; all other protection and identity/session semantics remain unchanged.
- [x] Primary CTA reuses existing auth/visitor and first-run contracts.
- [x] Source CTA and canonical repository are explicit.
- [x] Launch copy is derived from repository-owned marketing guidance rather than invented in implementation.
- [x] Alpha maturity and claim guardrails are explicit.
- [x] Browser support is evidence-derived rather than assumed.
- [x] Microphone/storage limitations are release requirements.
- [x] Local-first language distinguishes local core creation from optional hosted workflows.
- [x] Exact deployed revision and canonical URL are release evidence requirements.
- [x] Production smoke and human microphone evidence are separated from deterministic CI evidence.
- [x] Rollback uses existing deployment mechanisms and requires post-rollback verification.
- [x] CI continuity explicitly forbids weakening required checks.
- [x] README/product convergence is in scope; unrelated marketing expansion is not.

## Architecture / risk guardrails

- [x] No auth identity/session semantic change is planned or implemented.
- [x] No protection-semantics change beyond the single public Web root is planned or implemented.
- [x] No project schema/persistence ownership change is planned or implemented.
- [x] No `asset://` or durable audio contract change is planned or implemented.
- [x] No export/DSP architecture change is planned or implemented.
- [x] No backend hosting topology change is planned or implemented.
- [x] No Web/native bridge change is planned or implemented.
- [x] New deployment/security/data-loss behavior requires reclassification before implementation.
- [x] Architecture Graph preflight and post-implementation evidence show no tier escalation requirement.

## Verification quality

- [x] Exact candidate HEAD is required for automated evidence.
- [x] Existing launch-critical Playwright remains required and includes the new public landing step.
- [x] Focused landing/auth-shell/CTA tests are implemented.
- [x] Frontend/backend typecheck, Vitest, legacy, build, SDD and Graph gates remain required.
- [x] Real microphone evidence cannot be replaced by import-only CI.
- [x] Browser labels require release-specific evidence.
- [x] Documentation claims are reconciled after deployed evidence is known.
- [x] Required evidence uses PASS/FAIL/BLOCKED/FLAKY/NOT_REQUIRED semantics.
- [x] Human Merge Gate is against the exact verified PR HEAD.

## Human Design Gate

- [x] `spec.md` defines WHAT.
- [x] `plan.md` defines HOW and escalation boundaries.
- [x] `tasks.md` defines WORK.
- [x] `verification.md` defines PROOF.
- [x] Spec Kit analysis has no unresolved material contradiction or Constitution conflict; 16/16 requirements have task coverage.
- [x] Graph preflight has no unresolved tier escalation.
- [x] Exact Design Baseline SHA `e2ea8f8fd2ea192afcc395e30bb1bd53d81b2640` is recorded in PR #69.
- [x] Human Design Gate approval is recorded in PR #69 before product implementation.
