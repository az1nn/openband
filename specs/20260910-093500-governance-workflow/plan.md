# Plan: Spec Kit Governance Workflow

## Approach

Use project-owned policy/workflow files around the official Spec Kit v1.0.4 integration. Preserve least privilege by separating design and build runs.

## Changes

1. Replace `AGENTS.md` with concise operational policy: T0–T4, gates, context, worktrees and escalation.
2. Add `sdd/openband-design.yml` for design work under OpenCode `speckit`.
3. Add `sdd/openband-build.yml` for implementation/convergence under OpenCode `build`.
4. Add `sdd/openband.schema.json` for the feature sidecar.
5. Keep official `.specify/scripts`, templates and generated OpenCode commands untouched.
6. Keep `openband-ask` unchanged in this feature; its simplification belongs to the next migration slice.

## Workflow

```text
DESIGN RUN
specify → clarify? → plan → checklist? → tasks → analyze → HUMAN DESIGN GATE

BUILD RUN
implement → converge → implement again if tasks were appended → verify → HUMAN MERGE
```

The Workflow Engine owns run state. OpenBand does not parse free-form convergence output to invent a custom loop. If `converge` appends tasks, implementation is resumed explicitly and convergence is rerun.

## Design Delta

The following changes invalidate Design Approval:

- scope or acceptance criteria;
- architecture or durable contract;
- risk tier;
- structural dependency;
- weaker verification strategy.

Internal implementation details within the approved envelope do not.

## Verification

- validate both workflow YAML files with Spec Kit;
- validate `openband.json` examples against schema;
- confirm `AGENTS.md` contains no OpenSpec lifecycle instructions;
- confirm `speckit` OpenCode profile cannot edit product source;
- confirm design/build runs use explicit OpenCode profiles;
- run repository CI in the PR.

## Architecture Decision

ADR: **NOT REQUIRED**. This changes engineering workflow, not product/runtime architecture. Durable governance lives in the Constitution and `AGENTS.md`.
