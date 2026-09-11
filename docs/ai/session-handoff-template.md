# SESSION_HANDOFF

> Derived bootstrap context only. Canonical Git-backed project state wins on conflict.

## Objective

- Session objective:
- Why this handoff exists:

## Repository State

- Repository: `az1nn/openband`
- Base branch:
- Working branch:
- Worktree:
- Current HEAD:
- Issue:
- PR:
- PR state:

## Spec Kit State

- Active feature:
- Lifecycle step:
- Risk tier:
- Risk triggers:
- Design Baseline SHA:
- Design Gate: `NOT_REQUIRED | PENDING | APPROVED | INVALIDATED`
- Merge Gate: `NOT_REQUIRED | PENDING | READY_FOR_HUMAN | INVALIDATED`

## Final Decisions

- 

## Superseded — Do Not Reuse

- 

## Completed

- 

## Canonical Artifacts

- Constitution:
- `AGENTS.md`:
- Feature spec:
- Plan:
- Tasks:
- Architecture:
- Contracts:
- ADRs:
- Relevant code/tests:
- Architecture Graph queries/evidence to refresh:

## Verification State

| Evidence | State | Bound to SHA / notes |
|---|---|---|
| Acceptance / focused tests |  |  |
| Typecheck |  |  |
| Build |  |  |
| Graph / SDD validation |  |  |
| Specialist review |  |  |
| Other required evidence |  |  |

Allowed states: `PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED`.

Verification is stale if its relevant HEAD changed.

## Open / Blocked

- 

## Freshness Risks

- 

## Next Action

1. 

## New Chat Bootstrap

Start by refreshing Git/PR state and reading `AGENTS.md` plus `docs/ai/context-handoff.md`.

Reconstruct bounded context progressively:

```text
L0  Constitution + AGENTS + feature/tier
L1  feature spec + impacted architecture/contracts/ADRs + Graph
L2  relevant code + tests + specialists
```

Then verify this handoff against current canonical state. Treat any mismatch as stale handoff data, not as authority.

Continue from **Next Action** only after confirming branch/worktree/HEAD, Spec Kit lifecycle state, risk tier, and applicable human gates.
