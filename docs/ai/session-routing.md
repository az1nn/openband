# OpenBand Session Routing

## Purpose

Prevent duplicate chats, forgotten work, repository drift and task drift by making every coding session reconstruct canonical OpenBand state before deciding what to do.

The session layer coordinates chats; it does not replace GitHub Issues, PRs, Spec Kit, CI, Architecture Graph, ADRs, contracts or human gates.

## Canonical repository boundary

Session routing in this repository is valid only for:

```text
az1nn/openband
```

A standalone `siga` must verify this exact repository identity from Git/GitHub state before task discovery or mutation. ChatGPT Project membership, model/account memory, organization ownership, a similar repository name, fork history or a previous chat are not repository proof.

If the resolved repository differs, route to `REPO_MISMATCH`, show both identities and perform no mutation.

## Law

```text
ONE TASK = ONE CHAT
ONE CHAT = AT MOST ONE TASK
```

A chat may continue its assigned task until completion or a genuine no-safe-work boundary. It may not silently roll into the next distinct task.

Read the canonical project skill first:

`.agents/skills/openband-session-router/SKILL.md`

The historical `.qwen/skills/auto-skill-session-router/SKILL.md` path is only a compatibility adapter.

## Session command

A standalone `siga` is the canonical OpenBand coding-session command.

It means:

```text
verify az1nn/openband
-> reconstruct canonical state
-> render OpenBand Agent Tree
-> reconcile live session ownership
-> route to ACTIVE/OWNED | ACTIVE/OBSERVER | WAITING | NEXT
```

It does not mean "continue from chat memory". An existing foreign session owns **its task**, not the new chat: routine `siga` must mark that work occupied and continue discovery for a distinct independent task.

## Canonical discovery probes

At session entry inspect, as applicable:

1. `RepoProbe` — default branch and exact base SHA;
2. `GitHubProbe` — open PRs/issues, live session leases and Caveman handoffs;
3. `SpecKitProbe` — active feature/tasks/dependencies;
4. `EvidenceProbe` — exact-HEAD reviews, CI/checks and gates;
5. `DependencyProbe` — explicit blockers and stacked-work relationships;
6. domain specialists only when task impact requires them.

Operational status belongs to GitHub Issues/PRs. `docs/roadmap.md` provides direction, not delivery truth.

## Visible OpenBand Agent Tree

Every standalone `siga` must show a compact operational tree before long work:

```text
OPENBAND AGENT TREE
az1nn/openband @ <base-sha>
└─ SessionRouter
   ├─ RepoProbe ............ PASS | BLOCKED
   ├─ GitHubProbe .......... PASS | BLOCKED
   ├─ SpecKitProbe ......... PASS | NOT_REQUIRED | BLOCKED
   ├─ EvidenceProbe ........ PASS | FAIL | RUNNING | STALE | BLOCKED
   ├─ DependencyProbe ...... <dependency summary>
   ├─ Active work
   │  ├─ #<issue> / PR #<pr> [ACTIVE|WAITING|READY] owner=<this-session|foreign-session|none>
   │  └─ ...
   ├─ Candidate work ....... #<issue> [READY|PLANNING] owner=<none>
   └─ Route ................ ACTIVE/OWNED | ACTIVE/OBSERVER | WAITING | NEXT | REPO_MISMATCH
```

The tree must expose explicit dependencies and dependency shape, not just a flat PR list. Example: if NOC work depends on merge-governance work, show the dependency beneath/alongside those task nodes.

This is visibility over canonical evidence, not a second project-management system.

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

Ownership is positive, not inferred: this chat owns a lease only when it already established the same `SESSION_KEY`. Matching task, branch, PR, repository or GitHub user does not prove ownership. Without matching current-chat `SESSION_KEY` proof, an ACTIVE lease is foreign-owned.

A session lease never overrides canonical task state. Git/PR/issue/Spec Kit/CI evidence may prove it stale. Elapsed time alone does not prove abandonment.

## Route A — ACTIVE/OWNED

Choose `ACTIVE/OWNED` when the current task still has safe autonomous work, verification, remediation, cleanup or required CI and this chat owns the matching live session.

Delegate to `continue-work` and remain on exactly this task.

Running CI belongs to the current task. It is not permission to select unrelated next work.

## Route B — ACTIVE/OBSERVER

Choose `ACTIVE/OBSERVER` only when the user explicitly requests inspection/research/review of a task owned by another live session. Routine standalone `siga` marks that branch occupied and continues `NEXT` discovery instead.

This chat does not acquire task authority. It must not mutate the task branch, product code, Spec Kit artifacts, PR state or the foreign session lease, and it must not start a competing implementation lifecycle.

It may fan out bounded **read-only evidence work** to understand the active branch:

- research and specification/contract reading;
- Spec Kit state inspection;
- issue/PR dependency analysis;
- CI/check/log analysis;
- review-thread inspection;
- architecture/impact reading;
- specialist read-only review.

The law is:

```text
READ-ONLY EVIDENCE MAY FAN OUT
TASK AUTHORITY MAY NOT
```

Findings are surfaced to the user. Routine `siga` alone does not authorize writing them back to the foreign task.

If the original session is genuinely abandoned and work must move here, perform an explicit takeover audit, preserve the previous session identity and issue a new session key before mutation.

## Route C — WAITING

Choose `WAITING` when no safe current-task work remains before a genuine human or external boundary.

Examples include a Design Gate, real browser/device/hardware validation, required product/architecture decision, missing authorization, or an upstream dependency with no safe local progress remaining.

The response must identify the task, exact gate/blocker, exact action required, and evidence that becomes stale afterward.

This route applies when the waiting lease belongs to this chat. A foreign WAITING lease is shown in the tree but does not prevent an unbound chat from selecting independent work.

## Route D — NEXT

Choose `NEXT` when this chat is unbound. Foreign ownership is task-scoped: it excludes occupied tasks from mutation but does not globally block selection.

If this chat has prior owned work without formal closeout, close that owned task first. Do not close, update or take over a foreign lease.

Before ranking candidates, exclude foreign ACTIVE tasks, foreign WAITING tasks that would require same-task mutation, and any candidate whose implementation would compete with an occupied branch.

Discover the next task in this order:

1. independent still-valid planned `NEXT` from handoff/Spec Kit state;
2. independent ready GitHub issue/PR dependency-chain work;
3. independent Spec Kit planning/design work;
4. bounded planning/specification from canonical roadmap direction.

Prefer already-planned independent work. If implementation is occupied or structurally blocked, planning an independent future task is preferable to default observer mode.

A new/unbound chat may bind to exactly one task, then delegate lifecycle entry to `.agents/skills/openband-ask/SKILL.md` and Spec Kit.

A chat that already completed a different task may identify the next task and emit a compact next-session prompt, but must not execute it in the same chat.

## Relationship to task lifecycle

Session routing owns **which task this chat may own and what the user can see about parallel work**.

`openband-ask` + Spec Kit own **risk classification and lifecycle sequence**.

`continue-work` owns **finishing safe work inside the selected task**.

`caveman-handoff` owns **audited task closeout and durable continuation state**.

```text
siga
-> verify az1nn/openband
-> render OpenBand Agent Tree
-> session-router
   -> ACTIVE/OWNED    -> continue-work
   -> ACTIVE/OBSERVER -> explicit read-only inspection requested by user
   -> WAITING         -> surface blocker for this chat's owned task
   -> NEXT            -> exclude occupied work -> bind one independent task -> openband-ask / Spec Kit
   -> REPO_MISMATCH   -> stop with no mutation
```

## Minimal user-facing session status

Every standalone `siga` should begin with the tree followed by:

```text
SESSION: ACTIVE/OWNED | ACTIVE/OBSERVER | WAITING | NEXT | REPO_MISMATCH
TASK: <issue/PR/spec or selected task>
WHY: <canonical-state reason>
ACTION: <continue | observe | human action | start exactly one task | stop wrong repo>
```
