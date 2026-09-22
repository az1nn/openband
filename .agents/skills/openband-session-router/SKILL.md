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

A standalone `siga` starts or resumes one available OpenBand coding task from canonical project state. It never means "continue from chat memory".

A foreign live lease is an **occupancy signal**, not the default destination of a new session. The router must avoid competing with occupied work and continue discovery for a distinct available task.

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
   │  ├─ #<issue> / PR #<pr> [ACTIVE|WAITING|READY] owner=<this-session|foreign-session|none>
   │  └─ ...
   ├─ Candidate work ....... #<issue> [READY|PLANNING] owner=<none>
   └─ Route ................ ACTIVE/OWNED | ACTIVE/OBSERVER | WAITING | NEXT | REPO_MISMATCH
```

Rules:

- show all currently relevant live task branches needed to explain the route;
- show explicit dependencies (for example `#80 blocked_by #82`) rather than flattening work into one list;
- do not invent agents that were not needed;
- if a specialist is loaded, add it beneath the task that required it;
- if another session owns a task, mark that branch `owner=<foreign-session>` and never imply this chat owns it;
- treat foreign-owned ACTIVE/WAITING branches as occupied and exclude them from mutation candidates;
- show the independent task selected for this chat, or the planning candidate chosen when no implementation task is safely available;
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
- ownership requires positive proof: this chat owns a lease only when this chat previously established the same `SESSION_KEY`;
- matching issue, PR, branch, user identity, repository, or task topic is never ownership proof;
- without matching current-chat `SESSION_KEY` proof, an ACTIVE lease is `owner=<foreign-session>`;
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

Use only when the user explicitly asks this chat to inspect, research, review, or diagnose a task owned by another live session.

A routine standalone `siga` does **not** stop on a foreign-owned task. It marks that branch occupied and continues `NEXT` discovery for a distinct task.

The observer chat must **not** duplicate implementation, mutate the branch, update the lease, edit Spec Kit artifacts, change PR state, or start a competing lifecycle.

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

Keep/update the owning lease as `WAITING`. This route applies only when **this chat owns** that waiting task. A foreign WAITING lease is occupancy information and does not stop an unbound `siga` from selecting a different independent task.

### NEXT

Use when this chat is unbound and does not positively prove ownership of an existing lease. Foreign live ownership blocks **that task**, not the whole repository.

Before ranking candidates, remove:

- every ACTIVE task owned by another `SESSION_KEY`;
- every WAITING task owned by another session when continuing it would mutate the same task;
- any candidate whose implementation would directly compete with, overwrite, or require takeover of an occupied branch.

Discovery order:

1. an independent still-valid planned `NEXT` from verified handoff/Spec Kit state;
2. an independent ready GitHub issue/PR dependency-chain task;
3. an independent active Spec Kit planning/design task that does not mutate occupied work;
4. a bounded planning/specification task from canonical roadmap direction.

Prefer already-planned independent work over inventing new work. If all implementation candidates are occupied or structurally blocked, select safe planning/specification for a future independent task rather than defaulting to observer mode.

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

The router never replaces `/speckit.*`, `openband-ask`, the Constitution, automated design validation, convergence, verification or Merge Gate semantics.

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
- infer or fabricate a genuine human authorization;
- relabel stale/failing/running evidence as PASS;
- lower risk tier;
- infer ownership without matching current-chat `SESSION_KEY` proof;
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
