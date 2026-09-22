---
name: verified-context-handoff
description: Compatibility router for task-lifecycle-aware continuation and Caveman closeout. Never emit an early handoff while safe task work remains.
source: project-skill
created_at: '2026-09-17'
---

# Verified Context Handoff — Compatibility Router

## Purpose

Preserve the existing `verified-context-handoff` entrypoint while delegating behavior to the two canonical lifecycle skills introduced by #85.

This file is intentionally small. It does not duplicate continuation, verification, persistence, or Caveman-format rules.

## Canonical skills

Execution until closeout:

`.qwen/skills/auto-skill-continue-work/SKILL.md`

Closeout audit + persistence + handoff emission:

`.qwen/skills/auto-skill-caveman-handoff/SKILL.md`

## Routing contract

Whenever this entrypoint is invoked — including when the user says `gere handoff`, `generate handoff`, `handoff`, `continuity prompt`, or `new-chat prompt` — first determine whether the active task is at a genuine closeout boundary.

Use:

```text
SAFE_WORK_REMAINS
TASK_COMPLETE
BLOCKED_NO_SAFE_WORK
HUMAN_GATE_NO_SAFE_WORK
```

Routing:

```text
SAFE_WORK_REMAINS
-> run continue-work
-> complete/verify all safe current-task work
-> reach a genuine closeout boundary
-> give a concise lifecycle notice
-> run caveman-handoff
```

```text
TASK_COMPLETE | BLOCKED_NO_SAFE_WORK | HUMAN_GATE_NO_SAFE_WORK
-> run caveman-handoff
```

Never use:

```text
user asks for handoff -> stop task -> emit handoff
```

The user request controls the desired eventual output, not permission to abandon safe remaining work.

## Trigger semantics

- End of a material task: route directly to `caveman-handoff` only after proving no safe task work remains.
- Mid-task handoff request: route to `continue-work` first.
- YELLOW/RED context: context health alone does not authorize early handoff; reconstruct canonical state and use `continue-work` unless no safe progress remains.
- Correctable CI/review/base drift: continue fixing/reverifying inside the current task before handoff.
- Genuine human/external blocker: finish all safe precursor work, then Caveman may close out with the blocker recorded.

## Authority

Both delegated skills remain subordinate to:

- `AGENTS.md`
- `.specify/memory/constitution.md`
- Git / GitHub / Spec Kit
- architecture/contracts/ADRs
- tests / CI / Architecture Graph
- genuine human/external authorization state and evidence-driven Merge Gate state

A compatibility invocation cannot fabricate human/external authorization, mark an evidence-driven Merge Gate as satisfied, perform merge automation directly, relabel stale evidence as PASS, weaken verification, or start a distinct next task.
