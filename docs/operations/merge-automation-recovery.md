# Evidence Merge Recovery Runbook

## Purpose

Recover safely if **OpenBand Evidence Merge** is suspected of merging candidates that should have been blocked. This runbook governs repository merge automation only; it does not authorize production redeploys, credential rotation, destructive data repair, or other runtime mutations.

## Kill switch

1. **Disable** the OpenBand Evidence Merge workflow in GitHub Actions before making a repair that could trigger another merge.
2. Keep affected PRs draft or otherwise ineligible while the trust boundary is under investigation.
3. Do not re-enable automatic merge from a candidate branch.

## Containment and audit

1. Identify the default-branch revision of `.github/workflows/evidence-merge.yml` that executed the suspect merge.
2. **Audit** every merge performed while that workflow revision was active.
3. For each affected PR record the triggering CI run, exact PR HEAD, current `master` SHA, effective tier, Design Gate baseline, required evidence set, reviews, and merge result.
4. Treat uncertain or missing evidence as `BLOCKED` or `STALE`, never as PASS.

## Recovery

1. **Revert** the defective governance/workflow revision through the normal protected PR path to the previous known-good trust root.
2. Re-run repository governance/security verification against the recovery candidate.
3. Revalidate any previously merged candidate whose merge evidence is uncertain; create a corrective PR when repository state must be restored.
4. Use separate incident/credential procedures if external credentials or systems may have been affected.

## Re-enable

Re-enable OpenBand Evidence Merge only after:

- a fresh T4 analysis identifies the defect and corrected trust model;
- a Human Design Gate approves the exact corrective baseline;
- `openband-security` and `t4-evidence` adversarial checks pass;
- the privileged workflow still executes no candidate code or candidate artifacts;
- same-repository/fork blocking, exact HEAD/current-master freshness, required-evidence enforcement, and review blocking are verified.

After re-enable, **audit** the first automatic merge against the expected exact-SHA evidence trail.
