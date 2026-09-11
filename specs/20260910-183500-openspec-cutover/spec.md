# Feature: OpenSpec Cutover

**Tier:** T3 — engineering governance migration
**Issue:** #38

## Goal

Complete the one-way migration from OpenSpec to GitHub Spec Kit so Spec Kit is the sole SDD lifecycle authority while preserving the full legacy corpus in Git history.

## Requirements

- **FR-001** Every top-level legacy unit under `openspec/specs`, `openspec/changes`, and `openspec/archive` receives an explicit disposition in `docs/migrations/openspec-manifest.md`.
- **FR-002** Legacy artifacts are evidence, not current authority; no directory is copied wholesale into Spec Kit.
- **FR-003** Durable architecture/contracts needed by future work are distilled into current docs before deletion.
- **FR-004** Incomplete native-build verification is preserved as future demand in GitHub Issue #43, not silently declared complete.
- **FR-005** A Git checkpoint named `openspec-final` preserves the final reconciled tree while `openspec/` still exists.
- **FR-006** After the checkpoint, `openspec/` is removed atomically from the active tree.
- **FR-007** Active agent, Graph, CI, runtime, and durable documentation surfaces contain no OpenSpec lifecycle dependency after cutover.
- **FR-008** Archaeological references are allowed only in migration documentation and Git history/checkpoint descriptions.
- **FR-009** Spec Kit managed files remain upstream-pristine; the cutover does not modify `.specify/scripts/**`, `.specify/templates/**`, or generated `speckit.*` commands.
- **FR-010** `npm run sdd:check`, the full Graph regression suite, and `npm run graph:ci` pass after deletion.
- **FR-011** Product source behavior is unchanged by the cutover.

## Acceptance

1. Manifest coverage is 100% for top-level legacy units and records the checkpoint commit/tag.
2. `openspec-final` resolves to a commit that still contains `openspec/` and the final manifest.
3. Cutover branch HEAD contains no `openspec/` directory.
4. A repository-wide audit finds no live OpenSpec dependency outside `docs/migrations/**` and the cutover feature's historical explanation.
5. SDD/Graph gates remain green after deletion.
6. Issue #43 exists for native build verification residual work.
