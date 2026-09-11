# OpenSpec → Spec Kit

OpenBand is migrating from OpenSpec to GitHub Spec Kit.

## Decision

- Spec Kit becomes the sole SDD lifecycle framework.
- OpenSpec remains read-only evidence until atomic cutover.
- Migrate semantics and authority, not directories.
- GitHub Issues/PRs own operational status; Git owns history.
- Documentation must be concise, precise, and human-friendly.

## Baseline

- Umbrella issue: #38
- Source baseline before migration work: `e2ca47c023f4961a04eb80607d7345dae2f96512`
- Spec Kit: `v1.0.4`
- Integration: OpenCode
- Feature numbering: timestamp

## Delivery

1. Bootstrap Spec Kit.
2. Add OpenBand governance/workflow.
3. Reconcile architecture and agents.
4. Migrate Architecture Graph/policy checks.
5. Reconcile legacy OpenSpec and remove `openspec/` atomically.
6. Validate with a small real T2 feature.

The detailed implementation contract lives in the feature specs and PRs created under issue #38.
