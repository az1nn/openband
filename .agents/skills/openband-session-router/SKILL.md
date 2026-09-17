---
name: openband-session-router
description: Route standalone `siga` for the canonical az1nn/openband repository, expose the live agent tree, and prevent duplicate task ownership.
---

# OpenBand Session Router

## Repository lock

This skill is **only** valid for the canonical OpenBand repository:

```text
az1nn/openband
```

Before reading task state, creating/updating a session lease, selecting work, or delegating to another skill, resolve the repository from canonical GitHub/Git state.

If the resolved repository is not exactly `az1nn/openband`:

```text
REPO_MISMATCH
-> stop
-> show the resolved repository
-> show the required repository: az1nn/openband
-> perform no mutation
```

Never substitute a repository from model memory, account memory, another ChatGPT Project, organization similarity, a renamed/forked repository, or a previous chat. Repository identity is a hard safety boundary.

## Purpose

A standalone `siga` starts or resumes an OpenBand coding session from canonical project state. It never means "continue from chat memory".

The router owns **session selection and visibility**. Spec Kit remains the engineering lifecycle authority after routing.

Core law:

```text
ONE TASK = ONE CHAT
ONE CHAT = AT MOST ONE TASK
```

## Trigger

Treat `siga` as the canonical session command only when used standalone, ignoring case, surrounding whitespace and terminal punctuation.

Do not reinterpret prose that merely contains the word `siga`.

## Required canonical probes

After the repository lock passes, build the smallest sufficient state graph from canonical evidence:

1. `RepoProbe` — `az1nn/openband`, default branch, exact base SHA;
2. `GitHubProbe` — open issues/PRs, dependency links, marked session leases and Caveman handoffs;
3. `SpecKitProbe` — active feature/spec/tasks/dependencies when applicable;
4. `EvidenceProbe` — exact-HEAD CI/checks, reviews, required gates and stale evidence;
5. `DependencyProbe` — task/PR blockers and explicit stacked-work relationships;
6. domain specialists only when the selected task's impact requires them.

Chat/model memory may suggest where to look but is never a canonical probe.

## OpenBand Agent Tree

Every standalone `siga` must render a compact visible tree **before long work**. The tree is operational visibility, not a second lifecycle state machine.

Minimum shape:

```text
OPENBAND AGENT TREE
az1nn/openband @ <base-sha>
└─ SessionRouter
   ├─ RepoProbe ............ PASS | BLOCKED
   ├─ GitHubProbe .......... PASS | BLOCKED
   ├─ SpecKitProbe ......... PASS | NOT_REQUIRED | BLOCKED
   ├─ EvidenceProbe ........ PASS | FAIL | RUNNING | STALE | BLOCKED
   ├─ DependencyProbe ...... <active dependency summary>
   ├─ Active work
   │  ├─ #<issue> / PR #<pr> [ACTIVE|WAITING|READY] owner=<session|none>
   │  └─ ...
   └─ Route ................ ACTIVE/OWNED | ACTIVE/OBSERVER | WAITING | NEXT | REPO_MISMATCH
```

Rules:

- show all currently relevant live task branches needed to explain the route;
- show explicit dependencies (for example `#80 blocked_by #82`) rather than flattening work into one list;
- do not invent agents that were not needed;
- if a specialist is loaded, add it beneath the task that required it;
- if another session owns a task, mark that branch `owner=<foreign-session>` and never imply this chat owns it;
- keep the tree concise enough to be read at session start.

## Session lease

Live task ownership is a derived coordination artifact, persisted as one idempotent top-level PR comment when a PR exists, otherwise one issue comment:

```text
<!-- openband-session-lease -->
SESSION LEASE v1
SESSION_KEY: <stable generated key>
CHAT_LABEL: <short human-findable task label>
TASK: issue=<id|-> pr=<id|-> spec=<id|->
STATE: <ACTIVE|WAITING|CLOSED>
HEAD: <sha|->
WAITING_ON: <none|human:<gate>|external:<blocker>>
NEXT: <one current-task action or one next-session action>
UPDATED_AT: <ISO-8601 when available>
```

Rules:

- one live lease per task;
- update the existing marked comment instead of creating duplicates;
- lease state never overrides Git/PR/issue/Spec Kit/CI truth;
- elapsed time alone never proves abandonment;
- a new chat must not silently steal an `ACTIVE` lease.

## Routes

The router exposes these states:

```text
ACTIVE/OWNED
ACTIVE/OBSERVER
WAITING
NEXT
REPO_MISMATCH
```

`ACTIVE/OWNED`, `ACTIVE/OBSERVER` and `WAITING` are refinements of the repository's existing ACTIVE/WAITING/NEXT routing model; they do not create a competing lifecycle.

### ACTIVE/OWNED

Use when this chat owns the live task and safe work remains.

```text
ACTIVE/OWNED
-> invoke `.qwen/skills/auto-skill-continue-work/SKILL.md`
-> continue only this task
```

Running CI, remediation, verification, cleanup and convergence all remain part of the active task.

### ACTIVE/OBSERVER

Use when another live chat/session owns the current task.

The new chat must **not** duplicate implementation, mutate the branch, update the lease, edit Spec Kit artifacts, change PR state, or start a competing lifecycle.

It may perform bounded read-only observer work that improves project visibility without taking ownership:

```text
research
specification/contract reading
Spec Kit state inspection
PR/issue dependency analysis
CI/check/log analysis
review-thread inspection
architecture/impact reading
specialist read-only review
```

Observer law:

```text
READ-ONLY EVIDENCE MAY FAN OUT
TASK AUTHORITY MAY NOT
```

The observer can create a richer **analysis tree** under the foreign-owned task, but it cannot write task artifacts or claim completion. If it discovers actionable findings, report them to the user and, when appropriate, to the owning PR/issue only if the user explicitly asks for that mutation or repository policy already authorizes such reporting. Routine `siga` alone does not grant write authority.

If implementation must move to this chat because the original session was genuinely abandoned, perform an explicit audited takeover first. Preserve prior session identity in the audit trail and issue a new session key.

### WAITING

Use when no safe autonomous work remains before a genuine human/external gate.

Show:

- exact issue/PR/spec;
- exact gate/blocker;
- smallest action required to unblock;
- evidence that will become stale after the action.

Keep/update the owning lease as `WAITING`. Do not select unrelated next work merely because a task is waiting.

### NEXT

Use only when no conflicting live ownership blocks selection and this chat is unbound.

Discovery order:

1. still-valid `NEXT` from the latest verified Caveman handoff;
2. GitHub issue/PR dependency chain and unblockers;
3. active Spec Kit task/dependency state;
4. canonical roadmap direction.

Prefer work that unblocks existing dependency chains.

Before material mutation:

```text
NEXT
-> identify exactly one task
-> establish/refresh issue identity
-> bind one session lease as ACTIVE
-> hand off lifecycle execution to `openband-ask` / Spec Kit
```

A chat that already completed another task may identify the next task and emit a next-session prompt, but must not execute the distinct task in the same chat.

## Spec Kit handoff

After session ownership is resolved, engineering work follows the repository workflow:

```text
session-router
-> openband-ask
-> risk classification
-> bounded context
-> Spec Kit workflow when required
-> specialists as needed
-> continue-work
-> caveman closeout at the genuine task boundary
```

The router never replaces `/speckit.*`, `openband-ask`, the Constitution, Design Gate, convergence, verification or Merge Gate semantics.

## Required session-start output

Every standalone `siga` response begins with both the tree and a compact route summary:

```text
OPENBAND AGENT TREE
...

SESSION: ACTIVE/OWNED | ACTIVE/OBSERVER | WAITING | NEXT | REPO_MISMATCH
TASK: <issue/PR/spec or selected task>
WHY: <one sentence from canonical evidence>
ACTION: <continue | observe | human action | start exactly one task | stop wrong repo>
```

## Child skills

Canonical task entry after routing:

`.agents/skills/openband-ask/SKILL.md`

Live task execution:

`.qwen/skills/auto-skill-continue-work/SKILL.md`

Task closeout:

`.qwen/skills/auto-skill-caveman-handoff/SKILL.md`

Compatibility handoff router:

`.qwen/skills/auto-skill-verified-context-handoff/SKILL.md`

## Safety invariants

This skill cannot:

- operate on any repository other than `az1nn/openband`;
- infer repository identity from memory;
- approve a human gate;
- relabel stale/failing/running evidence as PASS;
- lower risk tier;
- silently steal an active task;
- mutate a foreign-owned task in observer mode;
- start a second distinct task in a chat already bound to one;
- use roadmap text as proof of delivery state;
- create a parallel lifecycle outside GitHub + Spec Kit.

## Related policy

Read and follow:

- `AGENTS.md`
- `docs/ai/session-routing.md`
- `docs/ai/context-handoff.md`
- `docs/ai/durable-context.md`
- `.specify/memory/constitution.md`
