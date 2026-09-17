# Implementation Notes

The revised T4 Design Baseline `2e1a3cea840172031c425cd7dd316e0d23690590` was approved by the project owner and recorded both in `design-gate.md` and the marked PR Design Gate comment.

Implementation now enforces the approved trust model:

1. **Machine-readable evidence contract** — active T2+ metadata uses schemaVersion 2 + `requiredChecks`; historical schemaVersion 1 feature records remain valid.
2. **Trusted privileged boundary** — `workflow_run` policy executes from the default branch, rejects fork/untrusted head repositories, checks current `master` ancestry and exact HEAD identity, and never checks out or executes candidate code/artifacts.
3. **Independent T4 proof** — read-only `openband-security` and `t4-evidence` jobs validate Design Gate ancestry/contract, path-derived T4 elevation, CI anchors and recovery evidence before the final merge job receives write permissions.
4. **Recovery** — `docs/operations/merge-automation-recovery.md` defines disable, audit, revert and re-enable behavior.

The workflow introduced by this PR becomes active only after its file exists on the default branch. PR #82 therefore remains the one-time bootstrap case; its candidate implementation must be verified against the same T4 contract before integration under the repository policy currently in force.
