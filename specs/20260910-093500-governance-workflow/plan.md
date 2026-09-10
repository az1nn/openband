# Plan: Spec Kit Governance Workflow

## Approach

Use project-owned policy/workflow files around the official Spec Kit v1.0.4 integration.

## Changes

1. Replace `AGENTS.md` with concise operational policy: T0–T4, gates, context, worktrees and escalation.
2. Add `sdd/openband-workflow.yml` as the T2+ workflow definition executed by `specify workflow run`.
3. Add `sdd/openband.schema.json` for the feature sidecar.
4. Keep official `.specify/scripts`, templates and generated OpenCode commands untouched.
5. Keep `openband-ask` unchanged in this feature; its simplification belongs to the next migration slice.

## Workflow

```text
preflight
→ specify
→ clarify? 
→ plan
→ checklist?
→ tasks
→ analyze
→ DESIGN GATE
→ implement
→ converge
→ verification
→ HUMAN MERGE
```

`converge` may append tasks but never edits code. If tasks are appended, resume implementation and run convergence again.

## Design Delta

The following changes invalidate Design Approval:

- scope or acceptance criteria;
- architecture or durable contract;
- risk tier;
- structural dependency;
- weaker verification strategy.

Internal implementation details within the approved envelope do not.

## Verification

- validate workflow YAML structure;
- validate `openband.json` examples against schema;
- confirm `AGENTS.md` contains no OpenSpec lifecycle instructions;
- confirm `speckit` OpenCode profile still cannot edit product source;
- run repository CI in the PR.

## Architecture Decision

ADR: **NOT REQUIRED**. This feature changes engineering workflow, not product/runtime architecture. The durable governance decision lives in the Constitution and `AGENTS.md`.
