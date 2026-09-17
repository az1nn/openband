---
name: continue-work
description: Resume the active OpenBand task until a genuine task closeout boundary is reached; do not emit a handoff while safe autonomous work remains.
source: project-skill
created_at: '2026-09-17'
---

# Continue Work

## Purpose

Keep the active task alive until it is actually ready to close out.

This skill exists to prevent an early handoff from becoming a substitute for finishing work. A user request such as `gere handoff`, `generate handoff`, `handoff`, `continuity prompt`, or `new-chat prompt` does **not** by itself mean the task should stop.

If safe work remains, continue the current task first. Only after the task reaches an eligible closeout boundary may `.qwen/skills/auto-skill-caveman-handoff/SKILL.md` run.

It never emits a handoff itself.

## Non-negotiable contract

```text
request handoff
-> reconstruct current task
-> safe work remains? continue it
-> verify current task
-> genuine closeout boundary
-> brief completion/blocker notice
-> caveman-handoff
```

Never use:

```text
request handoff -> stop active work -> emit handoff
```

## Mandatory triggers

Run this skill when:

- the user asks for a handoff while the active task is not yet at a closeout boundary;
- the compatibility `verified-context-handoff` entrypoint discovers safe remaining work;
- context health is YELLOW or RED but the active task can still be reconstructed safely from canonical state;
- verification finds a correctable technical/process gap inside the current task;
- base movement, stale evidence, CI failure, review feedback, or temporary scaffolding creates safe remediation work for the current task.

Do not trigger merely to start a distinct future workstream.

## Phase A — Reconstruct the active task

Refresh canonical state before acting. When applicable inspect:

1. repository and target base + exact SHA;
2. active branch/worktree + exact HEAD;
3. issue / PR / Spec Kit feature;
4. tier, gates and lifecycle step;
5. current tasks/checklists/acceptance criteria;
6. changed files and temporary scaffolding;
7. reviews / unresolved threads;
8. CI/tests/Graph evidence and freshness;
9. relevant architecture/contracts/ADRs.

Canonical state wins over chat, model memory, prior handoffs, and stale summaries.

## Phase B — Determine whether safe work remains

Classify remaining work internally as:

```text
SAFE_AUTONOMOUS
HUMAN_GATE
EXTERNAL_BLOCKER
DONE
OUT_OF_SCOPE_NEXT_TASK
```

### SAFE_AUTONOMOUS

Continue now. Examples:

- implementation or documentation required by the current task is incomplete;
- a failing test exposes a real fixable defect;
- required verification has not been run and can be run now;
- stale evidence can be refreshed;
- branch/base reconciliation is required and safe;
- review feedback can be resolved without a new human decision;
- temporary scripts/workflows/scaffolding still need cleanup;
- durable policy/contract knowledge learned during the task still needs promotion.

Do not stop merely because the work is lengthy or the user asked for a handoff.

### HUMAN_GATE

A required human decision or approval is a valid stopping boundary only after all safe work before that gate is complete. Examples: T2+ Design Gate, Human Merge Gate, or real hardware/browser judgment that cannot be automated.

Do not fabricate approval and do not leave routine work pending before the gate.

### EXTERNAL_BLOCKER

A blocker is eligible only when no safe autonomous progress remains in the current task. Examples: unavailable required external system, missing authorization, or an upstream dependency that must land first.

### DONE

The current task's required scope and applicable verification are complete, or only the explicit human action that defines task completion remains.

### OUT_OF_SCOPE_NEXT_TASK

Do not start a distinct task just to avoid closing the current one. Close out the current task first; the next task gets its own branch/Spec/PR when required.

## Phase C — Continue autonomously

For every `SAFE_AUTONOMOUS` item:

1. perform the smallest correct next action;
2. verify the result from canonical evidence;
3. fix real defects instead of weakening tests or policy;
4. refresh task state;
5. repeat until no safe autonomous work remains.

Rules:

- do not ask the user to repeat known information;
- do not ask for routine confirmation;
- do not perform work asynchronously or promise future completion;
- do not silently broaden into another task;
- respect all T2+ gates exactly;
- if HEAD changes, affected evidence becomes stale;
- if base changes materially, re-evaluate gate freshness and scope;
- preserve issue = demand, Spec Kit = engineering change, PR = integration evidence, Git = history.

## Phase D — Task closeout boundary

A Caveman handoff is eligible only when one of these is true:

```text
TASK_COMPLETE
BLOCKED_NO_SAFE_WORK
HUMAN_GATE_NO_SAFE_WORK
```

Not eligible:

```text
SAFE_WORK_REMAINS
ONLY_CONTEXT_IS_LONG
ONLY_USER_SAID_GENERATE_HANDOFF
NEXT_ROUTINE_STEP_IS_KNOWN
CI_IS_RUNNING_WHILE_OTHER_SAFE_WORK_REMAINS
```

Before delegating, give the user a concise lifecycle notice describing what was completed in this continuation and, if applicable, the exact blocker/human gate. This notice is not the handoff artifact itself.

Then invoke/read and follow:

`.qwen/skills/auto-skill-caveman-handoff/SKILL.md`

## Context-health rule

Context health never overrides task lifecycle.

- GREEN: continue normally.
- YELLOW: finish the current safe work and drive the task to closeout.
- RED: reconstruct canonical state aggressively; continue only actions that remain trustworthy from canonical evidence. RED alone is not permission to emit an early handoff.

If RED itself makes further work unsafe and canonical reconstruction cannot restore confidence, classify that as `EXTERNAL_BLOCKER`/`BLOCKED_NO_SAFE_WORK`, state the reason precisely, then close out.

## Gate safety

This skill cannot:

- approve a Design Gate;
- approve a Merge Gate;
- merge T2+ work;
- relabel running/queued/stale evidence as PASS;
- weaken acceptance criteria or tests;
- treat a user handoff request as approval to skip lifecycle work.

## Related policy

Read and follow:

- `AGENTS.md`
- `docs/ai/context-handoff.md`
- `docs/ai/durable-context.md`
- `.qwen/skills/auto-skill-caveman-handoff/SKILL.md`
- `.specify/memory/constitution.md`
