---
name: session-router
description: Route a standalone `siga` command from canonical repository state into exactly one of ACTIVE, WAITING, or NEXT without creating duplicate task chats.
source: project-skill
created_at: '2026-09-17'
---

# Session Router

## Purpose

Start or resume OpenBand coding sessions without losing unfinished work or creating duplicate chats for the same task.

This skill runs **before** task continuation or closeout. It answers one question first:

> Which task, if any, may this chat own?

## Core law

```text
ONE TASK = ONE CHAT
ONE CHAT = AT MOST ONE TASK
```

A chat already bound to a task must never roll forward into a distinct next task. When its task closes, that chat closes with it. The next task starts in a new chat/session.

## Trigger

Treat `siga` as the canonical session command only when it is used as a standalone command, ignoring case, surrounding whitespace and terminal punctuation.

Do not reinterpret ordinary prose containing the word `siga` as a session command.

`Siga` does not mean "do the next thing blindly". It means:

```text
refresh canonical state
-> determine session ownership
-> choose ACTIVE | WAITING | NEXT
-> execute only that route
```

## Canonical inputs

Before routing, refresh the smallest sufficient canonical state:

1. repository default branch + exact base SHA;
2. open PRs/issues relevant to active engineering work;
3. active branch/HEAD when this chat already has a task;
4. active Spec Kit feature/tasks when applicable;
5. latest marked session lease on the PR/issue;
6. latest marked Caveman handoff when useful;
7. reviews and exact-HEAD CI/check state;
8. applicable human gates and external blockers;
9. GitHub Issues/PRs first, then canonical roadmap/docs for next-work discovery.

Chat history, model memory and old handoffs are bootstrap hints only. Canonical repository/GitHub state wins on conflict.

## Session lease

Live task ownership is persisted outside Git HEAD so another chat can detect that the task already has a session.

Use one idempotent top-level PR comment when a PR exists, otherwise one issue comment, marked:

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
- a lease is derived coordination state, never architectural or product truth;
- PR/issue comments are preferred because they do not invalidate verified HEAD;
- do not persist secrets, credentials, transcripts or personal data;
- canonical PR/issue/Spec Kit/CI state may prove a lease stale;
- stale leases must be reconciled before routing.

`SESSION_KEY` is a coordination token, not a security credential. A new chat without the matching active session context must not silently take over an `ACTIVE` lease.

## Three routes

The router has exactly three user-facing routes:

```text
ACTIVE
WAITING
NEXT
```

### ACTIVE — current task still has safe work

Use when the task is still live, including implementation, remediation, cleanup, verification or CI that is part of the current task.

If this chat already owns the matching session/task:

```text
ACTIVE -> invoke continue-work
```

If another live session lease already owns the task:

```text
ACTIVE -> show existing session/task/PR + current state -> DO NOT create a duplicate session
```

Running CI is ACTIVE, not a reason to start another task. If safe work can run while CI executes, `continue-work` may do it. If only CI completion remains, report that the existing task/session is still active.

### WAITING — no safe autonomous work remains before a gate/blocker

Use when the current task is stopped on a real boundary such as:

- T2+ Human Design Gate;
- browser/device/hardware validation that automation cannot supply;
- required user decision;
- missing authorization;
- upstream/external dependency with no safe current-task work remaining.

Behavior:

```text
WAITING
-> surface the exact task/PR
-> surface the exact human gate or blocker
-> show the smallest action required to unblock it
-> keep/update the lease as WAITING
-> DO NOT select a next task
```

A human Merge Gate or other gate may exist under the repository policy currently in force; never infer approval from `siga` itself.

### NEXT — no live/waiting task owns this session slot

Use only when no conflicting `ACTIVE`/`WAITING` lease exists and this chat has not already completed a different task.

If a previous task is complete but lacks closeout:

```text
NEXT precondition
-> caveman-handoff closes/persists the previous task
-> close its session lease
```

Then discover the next task from canonical project state in this order:

1. explicit `NEXT` from the latest verified Caveman handoff if still valid;
2. open GitHub issue/PR dependency chain and unblockers;
3. active Spec Kit tasks/feature dependency graph;
4. canonical `docs/roadmap.md` only for direction, never as delivery status.

Prefer work that unblocks existing active dependency chains over unrelated new work. Do not invent priority from chat memory.

For a **new/unbound chat**:

```text
NEXT
-> identify exactly one task
-> establish/refresh issue identity before material mutation
-> create/update its session lease as ACTIVE
-> bind this chat to that task
-> invoke continue-work
```

For a chat that **already owned and completed another task**:

```text
NEXT
-> identify one next task
-> emit a compact NEXT SESSION prompt/key
-> DO NOT start it in this chat
```

That preserves `ONE TASK = ONE CHAT`.

## Duplicate-session prevention

Before binding an unbound chat to work, search for live session leases and reconcile them with canonical PR/issue state.

If one or more tasks are already `ACTIVE` or `WAITING`, show them first. Do not open another chat for the same task.

An existing lease may be treated as stale only when canonical evidence proves it, for example:

- PR merged/closed and task scope complete;
- issue closed/superseded;
- Caveman closeout says task complete and its referenced state still matches;
- lease HEAD/state contradicts newer canonical integration state.

Do not use elapsed time alone as proof that a session died.

## Takeover safety

Never silently steal an `ACTIVE` task from another session.

If recovery from a genuinely abandoned chat is required, first reconstruct canonical state and explicitly classify the old lease stale/recoverable. Preserve the prior `SESSION_KEY` in the audit trail and issue a new key before continuing.

Routine `siga` is not takeover authorization.

## Child skills

Live task execution:

`.qwen/skills/auto-skill-continue-work/SKILL.md`

Task closeout:

`.qwen/skills/auto-skill-caveman-handoff/SKILL.md`

Legacy handoff compatibility:

`.qwen/skills/auto-skill-verified-context-handoff/SKILL.md`

The session router owns only **session selection/ownership**. It must not duplicate implementation, verification or closeout rules from those skills.

## Output discipline

On `siga`, start with a compact session status before long work:

```text
SESSION: ACTIVE | WAITING | NEXT
TASK: <issue/PR/spec or newly selected task>
WHY: <one sentence from canonical evidence>
ACTION: <continue | human action | start one task>
```

When multiple existing leases are relevant, show a compact table/list and do not start duplicate work.

## Gate safety

This skill cannot:

- approve a Design Gate or other human validation;
- relabel failing/running/stale evidence as PASS;
- merge work contrary to the repository policy currently in force;
- lower risk tier;
- silently take over an active lease;
- start a second task in a chat already bound to another task;
- use roadmap text as proof of delivery status.

## Related policy

Read and follow:

- `AGENTS.md`
- `docs/ai/session-routing.md`
- `docs/ai/context-handoff.md`
- `docs/ai/durable-context.md`
- `.qwen/skills/auto-skill-continue-work/SKILL.md`
- `.qwen/skills/auto-skill-caveman-handoff/SKILL.md`
- `.specify/memory/constitution.md`
