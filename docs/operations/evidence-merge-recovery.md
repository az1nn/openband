# Evidence Merge Recovery / Kill Switch

Use this runbook when the privileged evidence merger is suspected to be defective, over-permissive, compromised, or producing incorrect merge decisions.

## Immediate containment

1. **Disable** `.github/workflows/evidence-merge.yml` in GitHub Actions or revert/remove its repository-write execution path on `master`.
2. Confirm no further `OpenBand Evidence Merge` runs can obtain write authority.
3. Do not compensate by weakening required CI/security/T4 evidence.

## Recovery

1. Identify the last known-good governance revision.
2. **Revert** the defective merger/policy change through the normal PR path.
3. **Audit** every PR merged by the affected workflow revision: exact candidate SHA, CI run, Design Gate record, trusted `openband-security`, trusted `t4-evidence`, and resulting merge SHA.
4. Re-open or remediate any merge whose trust chain cannot be reconstructed.
5. Run a fresh T4 threat-model/adversarial verification for the repair.

## Re-enable

Only **re-enable** privileged automatic merge after a fresh T4 Human Design Gate, exact-HEAD full CI, trusted security/T4 evidence, and confirmation that the default-branch evaluator cannot execute candidate-controlled code or artifacts.

This kill switch controls repository integration only. It does not authorize production rollback, credential rotation, destructive data repair, or redeploy.
