# SESSION_HANDOFF

> Derived bootstrap context only. Canonical Git-backed project state wins on conflict.

## Default handoff — Caveman Mode

The verified-context-handoff skill performs the full closeout audit, then emits this compact artifact by default. Compression applies to the transferred text, never to verification depth.

```text
CAVEMAN HANDOFF v1

REPO: <url>
BASE: <branch>@<sha>
HEAD: <branch>@<sha>
WORK: issue=<id|-> pr=<id/state|-> spec=<id|-> tier=<tier|->
STATE: <VERIFIED_COMPLETE|IMPLEMENTED_NOT_VERIFIED|INCOMPLETE|PROCESS_DRIFT>

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

## Required semantics

The compact handoff must preserve, when applicable:

- target base and exact base SHA;
- working branch/worktree and exact HEAD;
- issue, PR and Spec Kit identity;
- risk tier / lifecycle state;
- closeout classification;
- current-cycle implementation delta;
- verification evidence bound to the relevant HEAD;
- blocking review, human gate, or freshness risk;
- critical invariants / authority boundaries;
- one exact next action;
- verify-first contract.

Allowed evidence states:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE
```

A running workflow is not PASS. Evidence from an older relevant HEAD is STALE. A skipped job is acceptable only when explicitly not applicable.

## Compression rules

- Emit the Caveman handoff automatically at every material task, feature slice, verification cycle, PR freeze, or context boundary.
- Do not require a separate user request for a continuation prompt.
- Prefer SHAs, IDs, run IDs, paths and short state labels over prose.
- Carry only the current delta plus facts required to execute `NEXT` safely.
- Reference canonical specs/ADRs/docs instead of copying their contents.
- Omit empty optional fields.
- Normal target: roughly 250–700 tokens; correctness overrides the budget.
- Expand only when compression would hide a blocker, ambiguity, human gate, process drift, or authority boundary.

## Fallback expansion

If Caveman format cannot safely encode the handoff, add only the missing operational fields rather than restoring a project-history dump. Useful optional fields:

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

If previous PASS evidence is bound to a stale HEAD, rerun it before treating the task as verified. Continue from `NEXT` only after canonical state, evidence freshness and applicable human gates are confirmed.
