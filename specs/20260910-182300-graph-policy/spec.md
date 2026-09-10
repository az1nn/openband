# Feature: Spec Kit Architecture Graph and Policy Checks

**Tier:** T3 — engineering architecture/tooling
**Issue:** #38

## Goal

Make the Architecture Graph reason over current Spec Kit/durable knowledge and enforce objective SDD invariants without becoming a second lifecycle engine.

## Requirements

- **FR-001** Graph specification nodes come only from normative artifacts: `specs/*/spec.md`, `docs/architecture.md`, `docs/adr/**/*.md`, and `docs/contracts/**/*.md`.
- **FR-002** `.specify/**`, feature `plan.md`, feature `tasks.md`, migration notes, and arbitrary docs are not graph authority.
- **FR-003** Repository paths cited by normative artifacts continue to produce `specifies` edges when resolvable.
- **FR-004** Unresolved normative citations continue to surface as `OB-GRAPH-003` without OpenSpec-specific wording.
- **FR-005** Existing graph schema and deterministic serialization remain compatible.
- **FR-006** Architecture Graph impact remains evidence that may elevate risk but never lowers the semantic tier.
- **FR-007** A zero-dependency SDD checker validates feature `openband.json` metadata and required T2+ artifacts.
- **FR-008** T3/T4 features require an explicit architecture decision outcome in `plan.md` (`ADR: <path>` or `ADR: NOT REQUIRED`).
- **FR-009** T4 features require explicit adversarial verification and rollback/recovery planning.
- **FR-010** Sidecars must not contain mutable workflow/status/approval fields.
- **FR-011** CI runs both SDD policy checks and Architecture Graph checks.
- **FR-012** Graph-related agents/docs no longer describe OpenSpec as current authority.

## Acceptance

1. A fixture `specs/NNN-x/spec.md` becomes a `spec` node and can create `specifies` edges.
2. Fixture `tasks.md` and `.specify/**` do not become spec nodes.
3. `docs/architecture.md` and contract/ADR markdown become spec nodes.
4. No graph code depends on `openspec/`.
5. Existing graph determinism and `graph:ci` remain green.
6. Policy checker passes all current Spec Kit features and rejects malformed/forbidden sidecars in fixture tests.
7. CI includes `npm run sdd:check` before/with graph validation.
