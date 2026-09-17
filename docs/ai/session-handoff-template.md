# SESSION_HANDOFF

> Derived bootstrap context only. Canonical Git-backed project state wins on conflict.

## Objective

- Session objective:
- Why this handoff exists:

## Repository State

- Repository: `az1nn/openband`
- Base branch:
- Base SHA:
- Working branch:
- Worktree:
- Current HEAD:
- Issue:
- Parent / umbrella issue:
- PR:
- PR state:
- Mergeable:

## Spec Kit State

- Active feature:
- Lifecycle step:
- Risk tier:
- Risk triggers:
- Design Baseline SHA:
- Design Gate: `NOT_REQUIRED | PENDING | APPROVED | INVALIDATED`
- Merge Gate: `NOT_REQUIRED | PENDING | READY_FOR_HUMAN | INVALIDATED`

## Closeout Audit

- Outcome: `VERIFIED_COMPLETE | IMPLEMENTED_NOT_VERIFIED | INCOMPLETE | PROCESS_DRIFT`
- Scope vs issue/spec/tasks:
- Changed production files audited:
- Changed test files audited:
- Temporary workflows/scaffolding present: `YES | NO`
- Review threads/reviews blocking: `YES | NO`
- Base freshness / conflict notes:
- Human-only evidence still required:

### Scope checklist

| Expected item | State | Evidence / notes |
|---|---|---|
|  | `DONE | MISSING | PARTIAL | SUPERSEDED | NOT_REQUIRED` |  |

## Final Decisions

- 

## Superseded — Do Not Reuse

- 

## Completed

- 

## Known Defects Found / Fixed

- 

## Surfaces That Should Not Have Changed

- 

## Canonical Artifacts

- Constitution:
- `AGENTS.md`:
- Feature spec:
- Plan:
- Tasks:
- Verification/checklist:
- Architecture:
- Contracts:
- ADRs:
- Relevant code/tests:
- Architecture Graph queries/evidence to refresh:

## Verification State

| Evidence | State | Bound to SHA / notes |
|---|---|---|
| Acceptance / focused tests |  |  |
| Full unit/integration suite |  |  |
| Typecheck |  |  |
| Build |  |  |
| E2E / browser / native smoke |  |  |
| Graph / SDD validation |  |  |
| Post-implementation Graph impact |  |  |
| Specialist/adversarial review |  |  |
| Human hardware/device evidence |  |  |
| Other required evidence |  |  |

Allowed states: `PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE`.

Verification is `STALE` if its relevant HEAD changed. A running workflow is not PASS. A skipped job is acceptable only when its condition makes it explicitly not applicable.

## Last Known CI

- Workflow / run:
- Head SHA:
- Required jobs:
- Passed:
- Failed:
- Running:
- Skipped as expected:

## Review / PR Hygiene

- Unresolved review threads:
- Blocking reviews:
- Unexpected changed files:
- Temporary workflows/scripts:
- PR base still expected:
- PR still mergeable:

## Open / Blocked

- 

## Freshness Risks

- 

## Exact Next Action

1. 

## New Chat Verification Contract

Do **not** assume this task is complete because the previous chat says so.

Before acting, reconstruct canonical state from GitHub/Git/Spec Kit/tests/CI/Architecture Graph. Canonical state wins on conflict.

The new chat must verify at minimum:

1. current `master` / target base and base SHA;
2. branch/worktree and exact HEAD;
3. issue/parent issue/PR state and mergeability;
4. active Spec Kit feature/tasks/lifecycle/tier;
5. Design and Merge Gate freshness;
6. changed-file scope;
7. required tests from the feature artifacts;
8. CI result on the exact relevant HEAD;
9. Architecture Graph evidence when applicable;
10. review threads/reviews and temporary verification scaffolding.

If any previous PASS is tied to a stale SHA, rerun the affected evidence before treating the task as verified.

## New Chat Bootstrap

Start by refreshing Git/PR state and reading:

- `AGENTS.md`
- `docs/ai/context-handoff.md`
- `.qwen/skills/auto-skill-verified-context-handoff/SKILL.md`

Reconstruct bounded context progressively:

```text
L0  Constitution + AGENTS + feature/tier
L1  feature spec + impacted architecture/contracts/ADRs + Graph
L2  relevant code + tests + specialists
```

Then verify this handoff against current canonical state. Treat any mismatch as stale handoff data, not as authority.

Continue from **Exact Next Action** only after confirming canonical state, verification freshness, and applicable human gates.
