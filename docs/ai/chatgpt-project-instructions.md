# ChatGPT Project Instructions — OpenBand

This file is the repository-owned source for the ChatGPT Project instructions used when working on OpenBand.

Repository: `https://github.com/az1nn/openband`

For OpenBand development work, Git-backed code, GitHub Spec Kit artifacts, Constitution, `AGENTS.md`, architecture, contracts, ADRs, tests and Git history are canonical.

## Session law and `siga`

OpenBand follows:

```text
ONE TASK = ONE CHAT
ONE CHAT = AT MOST ONE TASK
```

A standalone `siga` is the canonical coding-session command. Before selecting or continuing work, read and follow the canonical project skill:

- `.agents/skills/openband-session-router/SKILL.md`;
- `.qwen/skills/auto-skill-session-router/SKILL.md` only as its compatibility entrypoint;
- `docs/ai/session-routing.md`.

### Hard repository lock

`Siga` is valid only when canonical Git/GitHub state resolves to exactly:

```text
az1nn/openband
```

Never infer the repository from ChatGPT Project membership, model/account memory, a previous chat, organization ownership or a similarly named repository. If the resolved repository is different, emit `REPO_MISMATCH`, show the resolved and required repositories, and perform no mutation.

### Visible OpenBand Agent Tree

Every standalone `siga` must show an `OPENBAND AGENT TREE` before long work. At minimum it shows the repository/base identity, SessionRouter, the canonical probes `RepoProbe`, `GitHubProbe`, `SpecKitProbe`, `EvidenceProbe`, and `DependencyProbe`, relevant active task branches, ownership, explicit dependencies, and the selected route.

`Siga` then routes to exactly one of:

```text
ACTIVE/OWNED
ACTIVE/OBSERVER
WAITING
NEXT
REPO_MISMATCH
```

- `ACTIVE/OWNED`: the current task still owns work and this chat owns the matching session; continue it.
- `ACTIVE/OBSERVER`: another live session owns the task; this chat may fan out bounded read-only research/specification, Spec Kit inspection, CI/review/dependency analysis and specialist review, but it must not mutate that task, lease, branch, PR, Spec Kit artifacts or product code.
- `WAITING`: no safe autonomous work remains before a human/external boundary. Show the exact gate/blocker and required action; do not select another task.
- `NEXT`: no conflicting live ownership blocks selection. A new/unbound chat may bind to exactly one next task, then route lifecycle execution through `openband-ask` and Spec Kit.
- `REPO_MISMATCH`: stop without mutation because the current repository is not `az1nn/openband`.

The observer law is:

```text
READ-ONLY EVIDENCE MAY FAN OUT
TASK AUTHORITY MAY NOT
```

Persist live task ownership through the idempotent marked PR/issue session lease defined by `docs/ai/session-routing.md`. A routine `siga` never silently takes over another `ACTIVE` lease.

At the beginning of a material development session:

1. Verify canonical repository identity is exactly `az1nn/openband`.
2. Read `.agents/skills/openband-session-router/SKILL.md`.
3. Render the OpenBand Agent Tree.
4. Refresh repository, branch, worktree, issue and PR state.
5. Read `AGENTS.md`.
6. Follow `docs/ai/context-handoff.md` and `docs/ai/durable-context.md`.
7. Reconstruct context progressively:

```text
L0  Constitution + AGENTS + feature/tier
L1  feature spec + impacted architecture/contracts/ADRs + Graph
L2  relevant code + tests + specialists
```

Do not load the entire repository or previous conversation history by default. Treat chat and model memory as disposable bootstrap context, never as required project state.

## Task-lifecycle-aware handoff

Use two canonical execution/closeout skills after session ownership is resolved:

- `.qwen/skills/auto-skill-continue-work/SKILL.md` — continue the active task until all safe autonomous work is complete;
- `.qwen/skills/auto-skill-caveman-handoff/SKILL.md` — perform closeout audit, durable persistence and compact handoff only at a genuine task closeout boundary.

`.qwen/skills/auto-skill-verified-context-handoff/SKILL.md` remains a compatibility router and must delegate to those skills rather than duplicate policy.

A Caveman handoff is eligible only when the current task is:

```text
TASK_COMPLETE
BLOCKED_NO_SAFE_WORK
HUMAN_GATE_NO_SAFE_WORK
```

If safe work remains, do not emit a handoff.

When the user says `gere handoff`, `generate handoff`, asks for a handoff/continuity prompt, or asks to move to a new chat while the current task is still live:

1. reconstruct canonical task state;
2. run `continue-work`;
3. complete and verify every safe current-task action available now;
4. do not start the next distinct task;
5. once the current task is complete or genuinely blocked with no safe progress remaining, tell the user concisely what was completed or what blocker remains;
6. run `caveman-handoff` and emit the compact artifact.

The user's handoff request specifies the eventual output, not permission to abandon unfinished work.

## Continue-work behavior

Continue autonomously through routine implementation, remediation, cleanup and verification. Do not ask for information already known or routine confirmation.

Correctable failures remain part of the active task:

- real test/CI defects;
- stale evidence that can be refreshed;
- actionable base reconciliation;
- resolvable review feedback;
- temporary scaffolding cleanup;
- missing canonical documentation/policy promotion required by the task.

Fix real defects instead of weakening tests or policy.

Stop only for:

- completed current task;
- required human gate after all safe precursor work is complete;
- genuine external blocker with no safe autonomous progress remaining.

Do not perform work asynchronously or promise later completion.

## Caveman closeout

At an eligible boundary, `caveman-handoff` must refresh canonical state, audit scope versus implementation, verify required tests/CI/Graph on the exact relevant HEAD/base, inspect reviews and temporary scaffolding, promote durable knowledge, persist operational state, and classify closeout as:

```text
VERIFIED_COMPLETE
IMPLEMENTED_NOT_VERIFIED
INCOMPLETE
PROCESS_DRIFT
```

If the audit discovers safe correctable work, return to `continue-work` instead of emitting an early handoff.

Persist short-lived continuation state using `docs/ai/durable-context.md`: prefer one idempotent marked PR comment, otherwise an issue comment, and use a repository handoff file only when no non-HEAD-mutating sink exists. Persistence must never silently invalidate a verified HEAD.

After persistence, emit one compact Caveman handoff. Caveman Mode saves tokens by compressing transferred context, never by skipping reasoning, tests, CI, Graph checks, review inspection, or gate validation.

The artifact must preserve, when applicable:

- repository + exact base SHA;
- branch/worktree + exact HEAD;
- issue / PR / Spec Kit identity;
- closeout state;
- current-cycle delta;
- exact-state verification evidence and freshness;
- blockers and human gates;
- critical invariants / authority boundaries;
- one exact next action;
- explicit verify-first instruction.

Prefer IDs, SHAs, run IDs and canonical paths over narrative. Do not repeat full specs, plans, ADRs, architecture, logs or old completed milestones.

## Context health

Monitor conversation health without reporting it every response.

- GREEN — context remains coherent; continue normally.
- YELLOW — a context/semantic boundary is approaching; refresh canonical state and continue the current task toward closeout.
- RED — chat history is not trustworthy enough for decision-relevant state; reconstruct bounded canonical context before continuing.

YELLOW/RED alone never authorizes an early handoff.

Conversation length, message count or tool-call count alone never trigger a chat change.

If RED, tell the user when useful:

> ⚠️ **Context boundary detected — canonical state will be reconstructed before continuing.**

Then reconstruct L0 → L1 → L2 and continue safe task work. Emit Caveman only after current-task closeout or a genuine no-safe-work blocker/human gate.

## Gate safety

Neither session routing, continuation nor handoff can:

- operate on a repository other than `az1nn/openband`;
- approve a Design Gate;
- mark verification PASS without current evidence;
- authorize or perform a T2+ merge;
- lower risk tier;
- override Spec Kit/Git/tests/Graph state;
- retroactively approve a missing gate because a PR was merged;
- silently take over another active session lease;
- mutate a foreign-owned task from observer mode;
- start a second distinct task in a chat already bound to one task.

If the Design Baseline SHA changed materially, treat Design Gate as invalid until re-analysis and human approval.

If verified HEAD/base changed, rerun affected verification before Merge Gate.

For T2+ work preserve:

```text
preflight
→ specify
→ clarify?
→ plan
→ checklist?
→ tasks
→ analyze
→ HUMAN DESIGN GATE
→ implement
→ converge
→ verify
→ HUMAN MERGE GATE
→ cleanup
```

Changing chats never resets, skips or satisfies lifecycle gates.
