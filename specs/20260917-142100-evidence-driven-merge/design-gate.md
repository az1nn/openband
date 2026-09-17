# Design Gate Evidence

## Previous baseline

- Baseline SHA: `5557c4fc242b20548637148034684c6d94c5ddc5`
- Previous decision: APPROVED
- Status: **INVALIDATED**
- Reason: privileged repository-write `workflow_run` makes the feature security-sensitive and minimum T4.

## Revised T4 baseline

- Design Baseline SHA: `2e1a3cea840172031c425cd7dd316e0d23690590`
- Decision: **APPROVED**
- Approved by: project owner
- Date: 2026-09-17
- Tier: T4
- Scope: evidence-driven exact-HEAD Merge Gate with a trusted default-branch privileged evaluator, fork blocking, machine-readable required-evidence contract, independent security/T4 evidence, adversarial regression coverage and recovery/kill-switch proof.
- Human merge ceremony: not part of the target steady-state design.
- Human Design Gate: satisfied for the revised baseline above.

The approval applies to the exact revised baseline SHA above. Material changes to the trust model, required-evidence strategy, privileged permissions, fork policy, recovery model, or T4 scope require re-analysis and a fresh Design Gate.
