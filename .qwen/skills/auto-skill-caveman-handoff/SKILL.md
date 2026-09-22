---
name: caveman-handoff
description: Audit, persist, and emit one compact verified continuation artifact only after the active task has reached a genuine closeout boundary.
source: project-skill
created_at: '2026-09-17'
---

# Caveman Handoff

## Purpose

Close out a material OpenBand task without transferring stale assumptions into the next step or chat.

This skill is **closeout-only**. It must never be used as a shortcut to stop an active task while safe autonomous work remains.

If the task is not yet at a closeout boundary, stop this skill and invoke:

`.qwen/skills/auto-skill-continue-work/SKILL.md`

## Entry gate

Before any handoff is emitted, classify the active task:

```text
TASK_COMPLETE
BLOCKED_NO_SAFE_WORK
HUMAN_GATE_NO_SAFE_WORK
SAFE_WORK_REMAINS
```

Only the first three are eligible for Caveman closeout.

`SAFE_WORK_REMAINS` means **do not emit a handoff**. Delegate to `continue-work`, complete/verify the remaining task work, then re-enter this skill.

A user phrase such as `gere handoff`, `generate handoff`, `handoff`, `continuity prompt`, or `new-chat prompt` never bypasses this entry gate.

## Non-negotiable contract

```text
eligible task closeout
-> reconstruct canonical state
-> audit completion
-> verify exact relevant HEAD
-> classify closeout
-> promote durable knowledge
-> persist operational state
-> emit one Caveman handoff
```

Caveman Mode is semantic compression, never verification reduction.

## Phase A — Reconstruct canonical state

Refresh authoritative state instead of trusting chat history. When applicable inspect:

1. repository + target base and exact SHA;
2. active branch/worktree + exact HEAD;
3. issue / umbrella issue / PR;
4. active Spec Kit feature/tasks/lifecycle;
5. tier, risk triggers and human gates;
6. relevant ADRs/contracts/architecture;
7. changed files and temporary scaffolding;
8. reviews / unresolved threads;
9. CI/tests tied to the exact relevant HEAD;
10. Architecture Graph evidence required by tier/impact.

Canonical state wins over chat, model memory, previous handoffs, or stale summaries.

## Phase B — Audit completion

Compare current state against applicable issue acceptance criteria, Spec Kit artifacts, contracts, ADRs and verification policy.

Classify expected scope internally as:

```text
DONE | MISSING | PARTIAL | SUPERSEDED | NOT_REQUIRED
```

If `MISSING` or `PARTIAL` work is safely actionable now, this task is not eligible for handoff: invoke `continue-work`.

Inspect changed code/tests/process docs for:

- TODO/FIXME or temporary scaffolding;
- weakened/masked/flaky tests;
- stale state consumed as current;
- duplicate/bypassed canonical boundaries;
- swallowed errors / false success;
- temporary workflows/scripts left behind;
- changes outside approved scope;
- conflicting or duplicated normative policy.

## Phase C — Verification and freshness

Evidence is valid only for the exact relevant HEAD/base state.

Allowed evidence states:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE
```

Rules:

- running/queued is not PASS;
- older relevant HEAD evidence is STALE;
- skipped is acceptable only when explicitly not applicable;
- masked failures are not proof;
- base movement can stale otherwise-green evidence;
- fix safe defects before closeout instead of documenting avoidable incompleteness.

Required evidence is risk-derived and can include focused tests, typecheck, full suites, build, E2E/native smoke, `sdd:check`, Graph/SDD checks, `graph:ci`, specialist review, reviews/threads, and human device/browser/hardware evidence.

## Phase D — Closeout classification

Use exactly one:

### VERIFIED_COMPLETE

Required scope is complete, required evidence is PASS on the exact relevant state, repository hygiene is clean, and only an explicitly human post-verification action may remain.

### IMPLEMENTED_NOT_VERIFIED

Implementation is complete but required evidence is running, stale, flaky, blocked, absent, or externally unavailable. This is eligible only when no safe verification/remediation action remains now.

### INCOMPLETE

Use only when the remaining work cannot be completed safely/autonomously now. If safe work remains, return to `continue-work` instead of emitting.

### PROCESS_DRIFT

Canonical process/repository state moved unexpectedly. If drift can be reconciled safely now, return to `continue-work`; otherwise record the blocker precisely.

## Phase E — Promote durable knowledge

Before final handoff, move long-lived facts to the canonical artifact that owns them:

- architecture/boundary -> ADR / architecture docs;
- cross-feature behavior -> `docs/contracts/`;
- workflow/agent rule -> `AGENTS.md`, skill, or AI policy docs;
- feature requirement -> active Spec Kit;
- implementation behavior -> code/tests;
- constitution-level invariant -> Constitution only when appropriate.

Do not leave durable project decisions only in chat, model memory, PR comments, or the handoff.

## Phase F — Persist operational continuation state

Use `docs/ai/durable-context.md` and the first safe sink:

1. active PR: maintain one top-level comment marked `<!-- openband-caveman-handoff -->`;
2. issue without PR: maintain one marked issue comment;
3. no PR/issue but writable branch: `.qwen/handoffs/<work-key>.md` before final verification, then reverify the resulting HEAD;
4. otherwise emit with `PERSIST: unavailable`.

Prefer updating the existing marked record rather than adding duplicates.

Persistence must not silently invalidate verification. Never create a post-freeze Git commit just to store the handoff when a PR/issue comment is available.

## Phase G — User-facing closeout

The continuation skill should already have given a concise lifecycle notice of what was completed or what genuine blocker remains.

Now emit **one** Caveman artifact and do not duplicate its facts in another long prose summary.

Use:

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

Omit empty optional fields. Normal target: 250–700 tokens; correctness overrides the budget.

## Caveman lint

Before persistence/emission confirm:

- [ ] task is at `TASK_COMPLETE`, `BLOCKED_NO_SAFE_WORK`, or `HUMAN_GATE_NO_SAFE_WORK`;
- [ ] no safe autonomous task work remains;
- [ ] exact base and HEAD are present when Git work exists;
- [ ] closeout classification matches evidence;
- [ ] no running/queued/stale check is labeled PASS;
- [ ] `DONE`, `PROOF`, `BLOCK`, `KEEP`, `NEXT` are delta-only and decision-relevant;
- [ ] `NEXT` is one executable action, not a roadmap;
- [ ] verify-first contract is present;
- [ ] no human gate approval is inferred;
- [ ] durable decisions were promoted canonically;
- [ ] operational state was persisted when a safe sink exists;
- [ ] persistence did not invalidate verification;
- [ ] handoff remains usable if chat/model memory disappear.

## Gate safety

A handoff cannot fabricate a genuine human/external authorization, mark an evidence-driven Merge Gate as satisfied, perform merge automation directly, lower risk tier, override Spec Kit/Git/tests/Graph, or retroactively authorize a process step.

## Related policy

Read and follow:

- `AGENTS.md`
- `docs/ai/context-handoff.md`
- `docs/ai/durable-context.md`
- `docs/ai/session-handoff-template.md`
- `.qwen/skills/auto-skill-continue-work/SKILL.md`
- `.specify/memory/constitution.md`
