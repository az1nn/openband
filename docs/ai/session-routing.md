# OpenBand Session Routing

## Purpose

Prevent duplicate chats, forgotten work and task drift by making every coding session reconstruct repository state before deciding what to do.

The session layer coordinates chats; it does not replace GitHub Issues, PRs, Spec Kit, CI, Architecture Graph, ADRs, contracts or human gates.

## Law

```text
ONE TASK = ONE CHAT
ONE CHAT = AT MOST ONE TASK
```

A chat may continue its assigned task until completion or a genuine no-safe-work boundary. It may not silently roll into the next distinct task.

## Session command

A standalone `siga` is the canonical OpenBand coding-session command.

It means:

```text
reconstruct canonical state
-> reconcile live session ownership
-> route to ACTIVE | WAITING | NEXT
```

It does not mean "continue from chat memory" and it does not authorize a new task when an existing task/session still owns the work.

## Canonical discovery order

At session entry inspect, as applicable:

1. default branch and exact base SHA;
2. open PRs/issues and their current state;
3. marked live session leases;
4. marked Caveman closeout records;
5. active Spec Kit feature/tasks/dependencies;
6. exact-HEAD reviews and CI/checks;
7. applicable human gates/external blockers;
8. canonical roadmap only after operational state is known.

Operational status belongs to GitHub Issues/PRs. `docs/roadmap.md` provides direction, not delivery truth.

## Session lease

The live-session record is a derived, non-HEAD-mutating coordination artifact.

Preferred sink:

1. active PR top-level comment;
2. otherwise active issue top-level comment.

Marker:

```text
<!-- openband-session-lease -->
```

Shape:

```text
SESSION LEASE v1
SESSION_KEY: <stable generated key>
CHAT_LABEL: <human-findable task label>
TASK: issue=<id|-> pr=<id|-> spec=<id|->
STATE: <ACTIVE|WAITING|CLOSED>
HEAD: <sha|->
WAITING_ON: <none|human:<gate>|external:<blocker>>
NEXT: <one exact current-task or next-session action>
UPDATED_AT: <ISO-8601 when available>
```

The comment must be updated idempotently instead of creating a stream of lease comments.

A session lease never overrides canonical task state. Git/PR/issue/Spec Kit/CI evidence may prove it stale.

## Route A — ACTIVE

Choose `ACTIVE` when the current task still has safe autonomous work, verification, remediation, cleanup or required CI in flight.

If the current chat owns that task, delegate to `continue-work`.

If another live session owns it, report that ownership and do not start a duplicate chat/task session.

Running CI belongs to the current task. It is not permission to select unrelated next work unless the current session itself has reached an eligible closeout boundary and no conflicting session exists.

## Route B — WAITING

Choose `WAITING` when no safe current-task work remains before a genuine human or external boundary.

Examples:

- Human Design Gate;
- required real browser/device/hardware validation;
- explicit product/architecture decision;
- missing authorization;
- upstream dependency with no safe local progress remaining.

The session response must identify:

- task / issue / PR;
- exact gate or blocker;
- exact human/external action required;
- whether any evidence would become stale after that action.

Do not open a new task merely because the current one is waiting.

## Route C — NEXT

Choose `NEXT` only when no conflicting `ACTIVE` or `WAITING` session exists for the work being considered.

If the prior task has not been formally closed, run Caveman closeout first and set its lease to `CLOSED`.

Discover the next task in this order:

1. still-valid `NEXT` from the latest Caveman artifact;
2. GitHub issue/PR dependency chain and unblockers;
3. active Spec Kit task/dependency state;
4. canonical roadmap direction.

Prefer the task that advances or unblocks existing work over unrelated expansion.

A new/unbound chat may bind to exactly one selected task and continue it.

A chat that already completed a different task may identify the next task and emit a compact next-session prompt, but must not execute it in the same chat.

## Duplicate prevention

A new chat using `siga` must not silently adopt an `ACTIVE` lease from another session.

A lease may be reconciled as stale only from canonical evidence, such as a merged/closed PR, completed/superseded issue, or verified closeout that still matches current repository state.

Elapsed time by itself does not prove abandonment.

If abandoned-session recovery is necessary, perform an explicit recovery/takeover audit and issue a new session key. Routine `siga` is not takeover authorization.

## Relationship to task lifecycle

Session routing owns **which task this chat may own**.

`continue-work` owns **finishing safe work inside the selected task**.

`caveman-handoff` owns **audited task closeout and durable continuation state**.

`verified-context-handoff` remains a compatibility router for handoff requests.

```text
siga
-> session-router
   -> ACTIVE  -> continue-work
   -> WAITING -> surface exact gate/blocker
   -> NEXT    -> close prior task if needed -> bind exactly one new task

continue-work
-> task complete / no-safe-work gate
-> caveman-handoff
```

## Minimal user-facing session status

Every standalone `siga` should begin by showing:

```text
SESSION: ACTIVE | WAITING | NEXT
TASK: <issue/PR/spec or selected task>
WHY: <canonical-state reason>
ACTION: <continue | human action | start exactly one task>
```

This status is intentionally compact. Detailed repository evidence should be loaded only as needed for the selected task.
