# Feature: Spec Kit Governance Workflow

**Tier:** T3 — engineering governance
**Issue:** #38

## Goal

Make Spec Kit the execution protocol for OpenBand changes without creating a second workflow engine.

## Requirements

- **FR-001** `AGENTS.md` is the single operational policy for agents and stays concise.
- **FR-002** Requests are classified T0–T4 before implementation.
- **FR-003** T2+ work uses Spec Kit artifacts and runs `analyze` before implementation.
- **FR-004** T2+ requires a human Design Gate before product-source edits.
- **FR-005** T2+ requires a human Merge Gate over the verified PR head.
- **FR-006** Direct `/speckit.*` use cannot bypass OpenBand policy.
- **FR-007** Spec Kit Workflow Engine owns sequence, gates and resume state; OpenBand does not implement a parallel state machine.
- **FR-008** Feature identity/assurance is stored in `openband.json` without status or approval fields.
- **FR-009** One active Spec Kit feature is allowed per worktree.
- **FR-010** Agents use progressive context: governance always, impacted knowledge next, code/tests last.
- **FR-011** `converge` is append-only; appended tasks return to `implement`.
- **FR-012** Required verification cannot treat FAIL, BLOCKED or FLAKY as PASS.

## Risk Rules

- T3 minimum: architecture boundary, persistence model or cross-runtime contract change.
- T4 minimum: security-sensitive work, possible data corruption, CRDT/concurrency correctness or critical deterministic DSP.
- Architecture Graph may elevate risk, never lower it.

## Acceptance

1. A T2+ workflow can pause at Design Gate before implementation.
2. The workflow includes `specify → plan → tasks → analyze → design gate → implement → converge` with optional clarification/checklist steps.
3. Policy states that material design changes require re-analysis and renewed Design Gate.
4. OpenCode exposes separate `plan`, `speckit` and `build` permission profiles without granting `speckit` product-source edits.
5. No OpenSpec lifecycle rule is introduced by this feature.
