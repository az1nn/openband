# Design Gate Evidence

## Previous baseline

- Baseline SHA: `5557c4fc242b20548637148034684c6d94c5ddc5`
- Previous decision: APPROVED
- Date: 2026-09-17
- Status: **INVALIDATED**

The previous T3 baseline is invalidated because re-analysis found a security-sensitive privileged `workflow_run` with repository write authority. OpenBand policy makes security-sensitive work minimum T4; tier and verification-strategy changes require a fresh Design Gate.

## Current state

- Decision: **PENDING_REANALYSIS_BASELINE**
- Implementation status: frozen for additional mutation until the revised T4 baseline is approved.
- Existing implementation is retained as provisional evidence only; it is not merge-eligible under the invalidated gate.
