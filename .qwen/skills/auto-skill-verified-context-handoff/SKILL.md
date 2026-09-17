---
name: verified-context-handoff
description: Audit canonical project state, verification evidence, and completion before producing a safe new-chat handoff at task or context boundaries.
source: project-skill
created_at: '2026-09-17'
---

# Verified Context Handoff

## Purpose

Use this skill to end a material OpenBand task/session without transferring stale assumptions into the next chat.

The skill does two jobs in order:

1. **Closeout audit** — prove what is actually complete on the current canonical state.
2. **Continuation handoff** — generate a paste-ready prompt that forces the next chat to reconstruct and verify state before acting.

This skill is orchestration only. It never overrides Git, Spec Kit, Constitution, `AGENTS.md`, architecture/contracts/ADRs, tests, Architecture Graph, CI, or human gates.

## Mandatory triggers

Run this skill when any of the following is true:

- a material task, issue slice, Spec Kit feature, verification cycle, or PR freeze is ending;
- the conversation is moving to another task/workstream;
- context health reaches YELLOW or RED under `docs/ai/context-handoff.md`;
- the chat is near a semantic/context limit and continuation will happen elsewhere;
- a PR was merged or unexpectedly changed while the session was active;
- the user asks for a handoff, continuation prompt, context transfer, or "new chat" prompt.

Do not trigger only because of message count or raw token count.

## Phase A — Reconstruct canonical state

Before writing the handoff, refresh authoritative state instead of trusting conversation history.

Minimum reconstruction:

1. repository and target base (`master` unless explicitly different);
2. active branch/worktree and exact HEAD;
3. issue state and umbrella/parent issue when applicable;
4. PR state, base SHA, head SHA, mergeability and draft state;
5. active Spec Kit feature, tasks and lifecycle step;
6. tier/risk triggers and gate state;
7. relevant ADRs/contracts/architecture;
8. review submissions and unresolved review threads;
9. current CI/workflow runs tied to the exact HEAD;
10. Architecture Graph evidence when required by tier/impact.

If repository state differs from the chat summary, repository state wins and the mismatch must be called out.

## Phase B — Completion audit

Do not ask only "did we implement it?". Audit the task against its own planned proof.

### Scope audit

Compare implementation against:

- issue acceptance criteria;
- `spec.md`;
- `plan.md`;
- `tasks.md`;
- `verification.md` / checklist when present;
- durable contracts and ADRs impacted by the feature.

Classify each expected item as:

```text
DONE | MISSING | PARTIAL | SUPERSEDED | NOT_REQUIRED
```

Do not silently treat an unchecked task as done because code exists.

### Code-quality audit

Inspect changed production/test files for at least:

- TODO/FIXME or temporary scaffolding;
- dead code / unreachable paths;
- fragile selectors or test-only product behavior;
- race conditions / arbitrary sleeps hiding state problems;
- stale route/query state consumed more than once;
- duplicated boundaries or bypassed canonical services;
- error paths that are masked, swallowed, or converted into false success;
- temporary workflows/scripts accidentally left in the diff;
- unexpected changes outside the approved risk envelope.

### Verification audit

Required evidence must be tied to the **same exact relevant HEAD**.

Check, when applicable:

- focused acceptance/regression tests;
- frontend/backend typecheck;
- full unit/integration suite;
- legacy tests;
- production build;
- E2E / Playwright / native smoke required by the feature;
- `sdd:check`;
- Graph/SDD tests;
- `graph:ci`;
- post-implementation Graph impact;
- specialist/adversarial review required by tier;
- human hardware/browser/device smoke that automation cannot replace.

Allowed evidence states:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE
```

Rules:

- A check from an older HEAD is `STALE` if relevant code/docs changed afterward.
- A workflow that is still running is not PASS.
- Skipped jobs are PASS only when the workflow condition makes them explicitly not applicable.
- `|| true`, masked failures, force-clicks, or weakened assertions do not count as evidence.
- If an E2E finds a real product defect, fix the product rather than bypassing the test.

### PR/repository hygiene audit

Confirm:

- PR still targets the expected base;
- base did not advance in a way that invalidates evidence;
- PR remains mergeable;
- no unresolved review threads/reviews block it;
- no temporary verification workflows remain;
- branch contains only the intended task scope;
- human Design/Merge Gate state has not been inferred or fabricated.

## Phase C — Decide closeout state

Use one of these outcomes:

### VERIFIED_COMPLETE

All planned scope is implemented, required evidence is PASS on the exact HEAD, repository hygiene is clean, and only an explicitly human gate/action may remain.

### IMPLEMENTED_NOT_VERIFIED

Implementation appears complete but one or more required checks are running, stale, flaky, blocked, or absent.

### INCOMPLETE

Scope/tasks or required behavior are missing/partial.

### PROCESS_DRIFT

The repository moved unexpectedly (for example PR merged before gate, base changed, branch reused, task closed early). Record the factual state; never invent retroactive approval.

Continue autonomously fixing technical gaps when safe. Stop only for a genuine human gate/blocker.

## Phase D — Produce the handoff package

Generate two artifacts in the response:

1. **Closeout summary** — short factual status with exact HEAD, tests, CI, Graph, blockers and PR.
2. **Paste-ready new-chat prompt** — detailed continuation prompt based on `docs/ai/session-handoff-template.md`.

The prompt must explicitly instruct the next chat to **verify**, not trust, the handoff.

Include:

- repository URL;
- issue/PR/branch/base;
- last known exact HEAD and base SHA;
- active Spec Kit feature/tier/lifecycle;
- approved Design Baseline and gate states;
- completed implementation;
- known defects fixed during the task;
- files/surfaces that should and should not have changed;
- exact automated checks expected;
- last known CI run and per-job state;
- Graph evidence and whether it must be rerun;
- review/thread state;
- human evidence still required;
- audit checklist for code/test quality;
- exact next action.

Always include language equivalent to:

> Do not assume the task is complete because the previous chat says so. Reconstruct canonical state from GitHub/Git/Spec Kit/tests/CI/Graph first. Canonical state wins on conflict.

## Gate safety

- A handoff cannot approve a Design Gate.
- A handoff cannot approve a Merge Gate.
- A prior user approval applies only to the clearly presented gate/baseline it approved.
- If Design Baseline SHA changes materially, Design Gate becomes invalid.
- If verified HEAD changes, affected verification must be rerun.
- Never describe a gate as approved retroactively because a PR was merged outside the expected process.

## Task-boundary behavior

At the end of every material task, even if the chat remains GREEN:

1. run the closeout audit;
2. report exact completion/verification status;
3. generate a continuation/handoff prompt when another task/chat is likely;
4. if the next workstream is distinct, require a new branch + new Spec Kit feature (when applicable) + new PR rather than reusing the previous PR.

This makes the end of a task a verification boundary, not merely a conversational summary.

## Context-boundary behavior

When context is YELLOW:

- finish the current safe atomic action;
- refresh canonical state;
- run the closeout audit;
- prepare the handoff before starting materially different work.

When context is RED:

- do not begin another material implementation step;
- finish/stop the current atomic action safely;
- run this skill;
- recommend a new chat;
- emit the paste-ready prompt.

## Self-check before emitting a handoff

- [ ] Canonical base/branch/HEAD refreshed.
- [ ] Issue/PR state refreshed.
- [ ] Spec Kit/tasks/gates refreshed.
- [ ] Changed files audited.
- [ ] Required tests identified from feature artifacts, not memory.
- [ ] CI result checked on exact HEAD.
- [ ] Graph evidence checked when applicable.
- [ ] Reviews/threads checked.
- [ ] Temporary workflows/scaffolding checked.
- [ ] Missing human evidence called out.
- [ ] No stale check described as PASS.
- [ ] No merge/design approval inferred.
- [ ] New-chat prompt instructs revalidation before action.

## Related canonical policy

Read and follow:

- `AGENTS.md`
- `docs/ai/context-handoff.md`
- `docs/ai/session-handoff-template.md`
- `docs/ai/chatgpt-project-instructions.md`
- `.specify/memory/constitution.md`
