---
name: openband-improve-architecture
description: Analyze module boundaries, Architecture Graph findings, and impact before structural changes.
---

# OpenBand Architecture Improvement

Use the zero-dependency Architecture Graph under `graph/` as evidence for structural decisions. It informs risk and blast radius; it does not replace semantic judgment or the Spec Kit lifecycle.

## Workflow

1. Run `npm run graph:impact -- <target>` or `npm run graph:context -- <target>` before planning a T2+ change that touches shared modules.
2. Run `npm run graph:validate` while designing structural changes.
3. Interpret findings:
   - `OB-GRAPH-001`: frontend bypasses the native bridge.
   - `OB-GRAPH-002`: dependency cycle.
   - `OB-GRAPH-003`: normative Spec Kit/architecture/ADR/contract artifact cites an unresolved repository path.
   - `OB-GRAPH-004`: orphaned source candidate.
   - `OB-GRAPH-005`: test-coverage gap.
4. Use graph evidence to KEEP or ELEVATE the semantic tier. Never downgrade risk because the graph looks small.
5. Prefer deep, stable interfaces and the smallest boundary change that resolves the issue.
6. Run `npm run sdd:check` and `npm run graph:ci` before declaring the engineering evidence clean.

## Rules

- No new graph runtime dependencies; `graph/` remains Node built-ins only.
- Preserve deterministic serialization and existing node/edge schema unless an approved architecture feature explicitly changes it.
- Do not suppress a finding merely to make CI green; fix the cause or document a narrowly justified allowlist change.
- Durable architecture decisions follow `docs/adr/README.md`; ordinary refactors do not create ADRs by default.
