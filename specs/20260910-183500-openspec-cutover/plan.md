# Plan: OpenSpec Cutover

## Approach

Reconcile first, checkpoint second, delete third. The tag must point to the final pre-deletion state so the entire legacy corpus remains inspectable without keeping it in the active working tree.

## Sequence

1. Audit all live `openspec` references outside the legacy directory.
2. Generate a complete top-level manifest for legacy specs/changes/archive with explicit dispositions.
3. Distill only cross-feature durable knowledge that is still required after reconciliation.
4. Preserve the known native build residual as Issue #43 (`FUTURE_RESPEC`).
5. Reconcile non-historical agent/docs/tests/tooling references so no runtime/tool depends on OpenSpec.
6. Validate manifest coverage and pre-cutover SDD/Graph health.
7. Create annotated tag `openspec-final` at the exact reconciled pre-deletion commit.
8. Remove `openspec/` in one commit.
9. Run negative-reference audit plus SDD/Graph regression after deletion.
10. Open the final stacked PR and require the human Merge Gate.

## Disposition model

Allowed manifest dispositions:

- `MIGRATE_ARCHITECTURE`
- `MIGRATE_ADR`
- `MIGRATE_CONTRACT`
- `MIGRATE_ACTIVE_FEATURE`
- `SUPERSEDED`
- `COMPLETED_HISTORY`
- `FUTURE_RESPEC`
- `STALE`
- `DUPLICATE`
- `DROP`

Legacy `archive/*` is historical by construction and is listed explicitly as `COMPLETED_HISTORY` unless an item is specifically overridden. Legacy domain specs are historical behavioral references unless selected for durable distillation. Legacy `changes/*` receives individual reconciliation rather than inheriting directory status.

## Verification

Before tag:
- manifest generator/check reports full coverage;
- repository audit distinguishes legacy/history from live dependencies;
- `npm run sdd:check`;
- `npm run test:graph-sdd`;
- `npm run graph:ci`.

After deletion:
- `test ! -d openspec`;
- repository grep allows `OpenSpec`/`openspec` only in `docs/migrations/**` and this cutover feature's archaeology text;
- `npm run sdd:check`;
- `npm run test:graph-sdd`;
- `npm run graph:ci`.

## Architecture Decision

ADR: **NOT REQUIRED**. The authority model and target engineering architecture were already approved and ratified in the migration/governance features. This feature executes the irreversible repository cutover without changing product runtime architecture.
