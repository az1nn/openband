# Feature: Knowledge and Agent Simplification

**Tier:** T3 — engineering architecture/governance
**Issue:** #38

## Goal

Replace duplicated OpenSpec-era knowledge and lifecycle skills with concise durable architecture and focused domain specialists.

## Requirements

- **FR-001** `docs/architecture.md` describes current topology, responsibilities and runtime boundaries against current code.
- **FR-002** Durable ADRs use `docs/adr/`; durable cross-feature contracts use `docs/contracts/` only when justified.
- **FR-003** `openband-ask` becomes a thin classifier/context/router into Spec Kit workflows.
- **FR-004** `openband-to-spec`, `openband-to-tickets`, `openband-implement` and `openband-handoff-keeper` are retired after useful rules are preserved elsewhere.
- **FR-005** Remaining architect/reviewer guidance no longer treats OpenSpec or `tasks.md` as independent authority.
- **FR-006** Operational status is not duplicated in handoff/pending documents.
- **FR-007** Product/usage documentation that is still useful is preserved.
- **FR-008** Documentation remains concise and human-friendly.

## Acceptance

1. A new agent can understand system boundaries from `docs/architecture.md` without reading an inventory of every component.
2. Lifecycle ownership is Spec Kit; OpenBand skills only add domain intelligence.
3. Removed status/handoff artifacts have no remaining operational references.
4. No current architecture document claims Expo SDK 56.
5. No product source behavior changes.
