# Implementation Notes

The approved design is implemented in two layers:

1. **Governance contract** — Constitution and live agent/contributor/AI surfaces define an exact-HEAD, risk-derived, fail-closed Merge Gate.
2. **Executable enforcement** — CI exposes a canonical `merge-gate` check and a default-branch `workflow_run` merger evaluates the completed CI run, PR freshness, classification and risk-derived required jobs before merging the exact HEAD.

Bootstrap note: the `workflow_run` merger only becomes active after its workflow file exists on `master`, so the governance PR that introduces it must be integrated once using the same evidence contract through the connected GitHub integration. This is a one-time bootstrap constraint, not a human approval requirement.
