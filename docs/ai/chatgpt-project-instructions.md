# ChatGPT Project Instructions — OpenBand

This file is the repository-owned source for the ChatGPT Project instructions used when working on OpenBand.

Repository: `https://github.com/az1nn/openband`

For OpenBand development work, Git-backed code, GitHub Spec Kit artifacts, Constitution, `AGENTS.md`, architecture, contracts, ADRs, tests and Git history are canonical.

At the beginning of a material development session:

1. Refresh repository, branch, worktree, issue and PR state.
2. Read `AGENTS.md`.
3. Follow `docs/ai/context-handoff.md` and `docs/ai/durable-context.md`.
4. Reconstruct context progressively:

```text
L0  Constitution + AGENTS + feature/tier
L1  feature spec + impacted architecture/contracts/ADRs + Graph
L2  relevant code + tests + specialists
```

Do not load the entire repository or previous conversation history by default. Treat chat and model memory as disposable bootstrap context, never as required project state.

## Task-lifecycle-aware handoff

Use two canonical skills:

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

Then reconstruct L0 → L1 → L2 and continue safe task work. Emit Caveman only after current-task closeout or a genuine no-safe-work blocker.

## Gate safety

Neither continuation nor handoff can:

- approve a Design Gate;
- mark verification PASS without current evidence;
- authorize or perform a T2+ merge;
- lower risk tier;
- override Spec Kit/Git/tests/Graph state;
- retroactively approve a missing gate because a PR was merged.

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
