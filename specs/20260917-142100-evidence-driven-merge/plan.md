# Plan: Evidence-Driven Merge Gate

## Approach

Keep human approval at the Design Gate, but make merge eligibility a deterministic evidence contract. The merge gate evaluates the exact candidate HEAD plus base freshness and fails closed whenever required proof is absent or unreliable.

This feature is **T4** because it introduces a privileged `workflow_run` with repository write authority. The security boundary is not the application runtime; it is the integrity of `master` and the trust chain that decides whether a candidate may write to it.

## Threat model

### Assets

- integrity of `master`;
- repository write authority carried by `GITHUB_TOKEN`;
- correctness of risk tier and required-evidence classification;
- authenticity/freshness of Design Gate and verification evidence.

### Adversarial / failure cases

- fork PR supplies untrusted code while the follow-up workflow has write authority;
- candidate modifies CI jobs so fake jobs with trusted names return success;
- candidate lowers or omits its security risk trigger/tier;
- candidate changes its required evidence after Design Gate;
- HEAD/base changes after evidence was produced;
- required checks are skipped, cancelled, stale or missing;
- a trust-root change attempts to validate itself using only candidate-controlled evidence;
- merge automation is defective and begins merging candidates it should block.

## Trusted execution boundary

1. PR CI remains unprivileged evidence production.
2. The privileged post-CI evaluator runs from the default branch and never checks out/executes candidate code or candidate artifacts.
3. The privileged evaluator blocks head repositories other than `az1nn/openband`.
4. For T2+, the approved design defines a machine-readable required-evidence contract. The evaluator unions it with mandatory repository checks and any path/risk-derived minimums.
5. Privileged-workflow / evidence-producer self-modification is minimum T4. Candidate-controlled success alone is insufficient; the evaluator requires independent security/adversarial evidence and a GitHub-native human Design Gate record.
6. The merge API is called only with the exact currently verified PR HEAD after base freshness, mergeability and blocking-review checks pass.

## Live governance surfaces

1. Amend `.specify/memory/constitution.md` so PR-first governance requires human Design Gate for T2+ and evidence-driven Merge Gate for all tiers.
2. Reconcile `AGENTS.md`, `CONTRIBUTING.md`, `openband-ask`, session/closeout skills and live AI policy docs.
3. Reconcile `sdd/README.md` and make `sdd:check` scan all live governance surfaces introduced after the original baseline.
4. Do not rewrite historical feature specs; they remain records of the policy in force when authored.

## Merge contract

A PR is merge-eligible only when all of the following are true:

- exact candidate HEAD and target-base relationship are current;
- machine-readable risk tier is valid and not below trusted path/risk-derived minimums;
- every mandatory + design-approved required check is `PASS` or justified `NOT_REQUIRED`;
- no required evidence is `FAIL`, `BLOCKED`, `FLAKY`, `STALE`, missing, cancelled or timed out;
- required specialist/security/T4 evidence is satisfied;
- Design Gate evidence is current for T2+;
- no active request-for-changes or policy contradiction remains;
- privileged trust boundary rules are satisfied.

## Evidence contract

Implementation will extend feature metadata/policy with a machine-readable list of required check names for T2+. The list is part of the approved verification strategy, not mutable operational status. The privileged evaluator takes the union of:

- mandatory common checks;
- feature-declared required checks;
- path-derived minimum checks;
- risk-trigger-derived checks;
- native/runtime checks when affected.

Missing producers remain `BLOCKED`; the evaluator never silently drops the requirement.

## Recovery

If the privileged merger is suspected to be defective:

1. disable the privileged merge workflow / remove its repository-write execution path;
2. stop further automatic merges;
3. revert the defective governance change to the previous known-good revision;
4. audit merges performed by the affected workflow revision;
5. rerun verification for any candidate whose merge trust is uncertain;
6. re-enable only after a fresh T4 Design Gate and adversarial/security verification.

No rollback step grants authority for credential rotation, production redeploy, or destructive data changes.

## Verification

- `npm run sdd:check`;
- `npm run test:graph-sdd` and `npm run graph:ci`;
- security-policy and dedicated `openband-security` evidence;
- dedicated `t4-evidence` producer;
- adversarial tests for fork head, stale/changed HEAD, stale base, missing/misclassified tier, missing required checks, fake/self-modified evidence producers, active request changes and exact-SHA mismatch;
- audit privileged workflow to prove it executes default-branch trusted policy and does not checkout/execute PR code;
- search all live governance surfaces for stale mandatory-human-merge semantics;
- verify historical `specs/` are not modified except this feature;
- verify recovery/kill-switch documentation is actionable.

## Architecture Decision

ADR: NOT REQUIRED

The durable security/governance contract is the Constitution + feature specification + live agent policy. No product-runtime architecture boundary changes.
