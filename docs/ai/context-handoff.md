# Conversation Context Handoff Policy

## Purpose

This policy defines how an AI-assisted OpenBand session handles conversation health without confusing a chat boundary with a task boundary.

It does **not** create a workflow engine or source of truth. Spec Kit, Git, Architecture Graph, ADRs, contracts, code, tests, CI and human gates remain authoritative.

Operational persistence is defined by `docs/ai/durable-context.md`.

## Core rule

**Context health and task lifecycle are separate.**

A long or noisy conversation may justify reconstructing state, but it does not justify abandoning safe work. A Caveman handoff is generated only at a genuine task closeout boundary.

```text
context problem != task finished
user asks for handoff != permission to stop task
```

The canonical skills are:

- `.qwen/skills/auto-skill-continue-work/SKILL.md` — finish all safe work in the active task;
- `.qwen/skills/auto-skill-caveman-handoff/SKILL.md` — closeout audit, persistence and compact handoff after the task reaches a closeout boundary;
- `.qwen/skills/auto-skill-verified-context-handoff/SKILL.md` — compatibility router only.

## Task closeout boundary

Caveman is eligible only when the active task is one of:

```text
TASK_COMPLETE
BLOCKED_NO_SAFE_WORK
HUMAN_GATE_NO_SAFE_WORK
```

Caveman is not eligible when:

```text
SAFE_WORK_REMAINS
ONLY_CONTEXT_IS_LONG
ONLY_USER_SAID_GENERATE_HANDOFF
NEXT_ROUTINE_STEP_IS_KNOWN
CI_FAILED_AND_FIX_IS_ACTIONABLE
BASE_MOVED_AND_RECONCILIATION_IS_ACTIONABLE
```

When safe work remains, run `continue-work` until the task reaches an eligible boundary.

## User-requested handoff

When the user says `gere handoff`, `generate handoff`, `handoff`, asks for a continuity prompt, or asks to move to a new chat:

1. reconstruct current canonical task state;
2. determine whether safe current-task work remains;
3. if yes, run `continue-work` and complete/verify that work;
4. do not start a distinct next task;
5. once the current task is complete or genuinely blocked with no safe progress remaining, tell the user concisely what was completed or what blocker remains;
6. run `caveman-handoff` and emit the compact artifact.

The requested output is eventual handoff, not early termination.

## Context health

A session continuously classifies context health as:

```text
GREEN  coherent and trustworthy enough to continue
YELLOW approaching a semantic/context boundary; refresh state soon
RED    chat history is no longer a trustworthy implementation snapshot
```

Length, message count and tool-call count alone do not change health.

### GREEN

Continue normally. If the active task reaches genuine closeout, run `caveman-handoff`.

### YELLOW

Finish the current safe work and drive the active task toward closeout. Refresh canonical state rather than carrying more chat assumptions.

YELLOW alone does not trigger Caveman.

### RED

Explicitly surface when useful:

> ⚠️ **Context boundary detected — canonical state will be reconstructed before continuing.**

Then:

1. stop relying on chat history for decision-relevant facts;
2. reconstruct bounded L0 → L1 → L2 context from canonical state;
3. use `continue-work` for any safe remaining current-task work;
4. emit Caveman only after task completion or a genuine no-safe-work blocker/human gate.

If canonical reconstruction itself cannot restore enough confidence for any safe progress, that condition may be classified as `BLOCKED_NO_SAFE_WORK`; record the reason precisely.

## Continue-work contract

`continue-work` owns the live task. It must:

1. refresh repository/base/branch/PR/issue/Spec Kit state;
2. inspect applicable tasks, acceptance criteria, reviews and verification;
3. classify remaining work as safe autonomous, human gate, external blocker, done, or distinct next task;
4. perform every safe autonomous current-task action now;
5. fix real defects rather than weaken checks;
6. clean temporary scaffolding;
7. refresh stale evidence when possible;
8. stop only at task completion or when no safe autonomous progress remains.

It never emits a handoff itself. It delegates closeout to `caveman-handoff`.

## Caveman closeout contract

At an eligible task boundary, `caveman-handoff` must:

1. refresh canonical repository/branch/PR/issue state;
2. compare implementation against issue + Spec Kit scope;
3. audit changed production/test/process files for partial, temporary, conflicting or weakened behavior;
4. verify required tests, CI and Graph evidence on the exact relevant HEAD/base;
5. inspect reviews, mergeability, base freshness and temporary scaffolding;
6. classify closeout as `VERIFIED_COMPLETE`, `IMPLEMENTED_NOT_VERIFIED`, `INCOMPLETE`, or `PROCESS_DRIFT`;
7. if safe correctable work is discovered, return to `continue-work` instead of emitting early;
8. promote long-lived decisions to their canonical artifacts;
9. persist short-lived operational state using `docs/ai/durable-context.md`;
10. emit one compact Caveman artifact with the exact next action.

Compression applies to transferred text only, never verification depth.

## Handoff shape

Use `docs/ai/session-handoff-template.md`.

The artifact preserves only decision-relevant resume state:

- repository / exact base SHA;
- branch/worktree / exact HEAD;
- issue / PR / Spec identity;
- closeout classification;
- current-cycle delta;
- exact-HEAD verification evidence and freshness;
- blockers / human gates;
- critical invariants / authority boundaries;
- one exact next action;
- verify-first instruction.

Normal target: roughly 250–700 tokens. Correctness overrides the budget.

Do not duplicate full specs, plans, ADRs, architecture, logs, chat transcripts, or old completed milestones.

## Durable continuity

Before persistence, separate durable knowledge from operational state.

- Long-lived project decisions belong in canonical ADR/spec/contract/architecture/policy/code/test artifacts.
- Short-lived resume state belongs in the Caveman handoff.
- Prefer one idempotent marked PR comment, otherwise an issue comment.
- A repository handoff file is fallback-only and must be written before final verification or the resulting HEAD must be reverified.
- Never rely on chat/model memory as the only copy of a project fact required for future work.

## Freshness rules

A handoff is derived context and never overrides canonical state.

A new chat verifies, at minimum:

1. repository + current target base;
2. active branch/worktree + expected HEAD;
3. issue + PR state;
4. active Spec Kit feature/tasks when applicable;
5. relevant architecture/contracts/ADRs;
6. Architecture Graph evidence when required;
7. required tests/CI on the exact relevant state;
8. Design Baseline / verification HEAD freshness.

Any mismatch means the handoff is stale on that fact and canonical state wins.

## Progressive reconstruction

A fresh or RED session reconstructs only the smallest sufficient context:

```text
L0  Constitution + AGENTS + feature/tier
L1  feature spec + impacted architecture/contracts/ADRs + Graph
L2  relevant code + tests + specialists
```

Do not import the previous conversation wholesale.

## Gate safety

Neither `continue-work` nor Caveman can:

- grant a Design Gate;
- mark verification PASS without current evidence;
- authorize a T2+ merge;
- lower risk tier;
- override Spec Kit/Git/tests/Graph;
- retroactively treat a merged PR as missing human approval.

Changing chats never resets, skips or satisfies lifecycle gates.
