# Implementation Notes

The initial T3 implementation exists on the branch, but is **provisional** after T4 reclassification.

Re-analysis on 2026-09-17 identified the privileged `workflow_run` / repository-write boundary as security-sensitive. That invalidates the previous Design Gate because the tier and verification strategy materially changed.

Until the revised T4 Design Baseline is approved:

- do not add further implementation/security-policy mutations;
- do not treat CI from the provisional implementation as merge evidence;
- preserve the current implementation for review rather than deleting it;
- allow only design/spec/task/gate-record updates required to establish the new baseline.

After approval, implementation resumes with the trusted default-branch evaluator, fork blocking, machine-readable required-evidence contract, dedicated security/T4 evidence, adversarial tests and recovery proof defined in the revised plan.
