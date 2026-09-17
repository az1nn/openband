# SESSION_HANDOFF

> Derived bootstrap context only. Canonical Git-backed project state wins on conflict.

## Eligibility

A Caveman handoff is **closeout-only**.

Before using this template, the active task must be at one of:

```text
TASK_COMPLETE
BLOCKED_NO_SAFE_WORK
HUMAN_GATE_NO_SAFE_WORK
```

If `SAFE_WORK_REMAINS`, do not fill or emit this template. Run `.qwen/skills/auto-skill-continue-work/SKILL.md` first.

A user request such as `gere handoff` or `generate handoff` requests the eventual artifact; it does not bypass unfinished safe work.

## Default handoff — Caveman Mode

`.qwen/skills/auto-skill-caveman-handoff/SKILL.md` performs the final closeout audit, promotes durable project knowledge, persists short-lived continuation state, then emits this compact artifact. Compression applies to transferred text, never verification depth.

```text
CAVEMAN HANDOFF v1

REPO: <url>
BASE: <branch>@<sha>
HEAD: <branch>@<sha>
WORK: issue=<id|-> pr=<id/state|-> spec=<id|-> tier=<tier|->
STATE: <VERIFIED_COMPLETE|IMPLEMENTED_NOT_VERIFIED|INCOMPLETE|PROCESS_DRIFT>
PERSIST: <pr-comment|issue-comment|file:<path>|unavailable>

DONE:
- <delta-only completed facts>

PROOF:
- <check/run>: <PASS|FAIL|BLOCKED|FLAKY|NOT_REQUIRED|STALE>@<sha-or-reason>

BLOCK:
- <none | unresolved blocker/human gate>

KEEP:
- <critical invariant/authority boundary only>

NEXT:
1. <single exact next action>

VERIFY-FIRST:
Reconstruct GitHub/Git/Spec Kit/tests/CI/Graph from canonical state before acting. Canonical state wins on conflict; stale PASS must be rerun.

PR: <direct URL when applicable>
```

`PERSIST` identifies where the same operational handoff was durably stored. Prefer an idempotent marked PR/issue comment because it does not mutate Git HEAD. See `docs/ai/durable-context.md`.

## Required semantics

The compact handoff preserves, when applicable:

- target base + exact base SHA;
- working branch/worktree + exact HEAD;
- issue, PR and Spec Kit identity;
- risk tier / lifecycle state when decision-relevant;
- closeout classification;
- durable persistence sink;
- current-cycle implementation delta;
- exact-state verification evidence;
- blocker / human gate / freshness risk;
- critical invariants / authority boundaries;
- one exact next action;
- verify-first contract.

Allowed evidence states:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE
```

A running or queued workflow is not PASS. Evidence from an older relevant HEAD/base is STALE. A skipped job is acceptable only when explicitly not applicable.

## Compression rules

- Emit only at a genuine current-task closeout boundary.
- Do not emit merely because context is YELLOW/RED or because the user asked for handoff while safe work remains.
- Promote durable decisions to canonical docs before final verification.
- Persist operational state using the sink order in `docs/ai/durable-context.md`.
- Prefer SHAs, IDs, run IDs, paths and short state labels over prose.
- Carry only current-cycle delta plus facts required to execute `NEXT` safely.
- Reference canonical specs/ADRs/docs instead of copying contents.
- Omit empty optional fields.
- Normal target: roughly 250–700 tokens; correctness overrides the budget.
- Expand only when compression would hide a blocker, ambiguity, human gate, process drift or authority boundary.

## Fallback expansion

If the base format cannot safely encode closeout state, add only missing operational fields:

```text
GATES: design=<...> merge=<...> human=<...>
REVIEW: threads=<...> blocking=<...>
FILES: <only unexpected or next-action-critical paths>
GRAPH: <run/evidence/freshness>
CI: <workflow/run + per-job exceptions>
DRIFT: <canonical mismatch/process drift>
```

## New-chat verification contract

Do **not** assume a task is complete because the previous chat says so.

Before acting, reconstruct canonical state from GitHub/Git/Spec Kit/tests/CI/Architecture Graph. Treat any mismatch with the handoff as stale handoff data.

Bootstrap progressively:

```text
L0  Constitution + AGENTS + feature/tier
L1  active feature + impacted architecture/contracts/ADRs + Graph
L2  relevant code + tests + specialists
```

If previous PASS evidence is bound to a stale HEAD/base, rerun it before treating the task as verified. Continue from `NEXT` only after canonical state, evidence freshness and applicable human gates are confirmed.
