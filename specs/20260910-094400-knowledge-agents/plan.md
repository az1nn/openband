# Plan: Knowledge and Agent Simplification

## Approach

Keep only durable knowledge and domain specialization. Remove lifecycle/status duplication.

## Changes

1. Create concise `docs/architecture.md` from current code/package evidence.
2. Establish `docs/adr/README.md` and `docs/contracts/README.md` as short usage rules; do not invent ADRs/contracts.
3. Rewrite `openband-ask` as a thin Spec Kit entrypoint.
4. Update `.opencode/agents/architect.md` to use Constitution, current architecture and active feature artifacts.
5. Retire the four lifecycle/status skills after preserving their useful invariants in `AGENTS.md`/workflow.
6. Remove stale handoff/pending status mirrors and replace legacy roadmap duplication with one strategic source.

## Verification

- grep active agent/docs surfaces for OpenSpec lifecycle references;
- verify removed skills/docs have no live references;
- verify architecture stack against `package.json` and bridge implementation;
- run repository CI after the stack reaches `master`.

## Architecture Decision

ADR: **NOT REQUIRED**. This reconciles documentation with already-existing architecture and changes engineering-agent organization, not runtime design.
