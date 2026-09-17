---
name: verified-context-handoff
description: Audit canonical project state, verification evidence, and completion before producing a safe token-efficient new-chat handoff at task or context boundaries.
source: project-skill
created_at: '2026-09-17'
---

# Verified Context Handoff

## Purpose

Use this skill to end a material OpenBand task/session without transferring stale assumptions into the next chat.

The skill does two jobs in order:

1. **Closeout audit** — prove what is actually complete on the current canonical state.
2. **Continuation handoff** — automatically generate a paste-ready continuation prompt that forces the next chat to reconstruct and verify state before acting.

This skill is orchestration only. It never overrides Git, Spec Kit, Constitution, `AGENTS.md`, architecture/contracts/ADRs, tests, Architecture Graph, CI, or human gates.

## Caveman Mode — mandatory default

**Caveman Mode is the default output mode for every handoff produced by this skill.** It is not opt-in and agents MUST NOT ask whether to enable it.

The objective is maximum operational continuity per token: preserve the state required to continue correctly, remove narrative repetition, and rely on canonical repository artifacts for durable detail.

### Core rule

At every material task boundary, verification boundary, PR freeze, context handoff, or explicit continuation request:

1. perform the full verification/audit phases in this skill;
2. keep the audit rigorous internally;
3. emit the continuation prompt automatically in Caveman format;
4. do not duplicate background that the next chat can reconstruct from canonical files;
5. expand beyond Caveman format only when compression would hide a blocker, ambiguity, safety boundary, human gate, or process drift.

The user does not need to ask for a continuation prompt separately.

### Compression contract

Caveman Mode is **semantic compression, not verification reduction**.

Always preserve:

- repository + base branch + exact base SHA;
- working branch + exact HEAD;
- issue/PR identifiers and current state when applicable;
- active Spec Kit feature/tier/lifecycle when applicable;
- closeout classification;
- delta actually completed in the current cycle;
- required verification evidence and freshness on the exact HEAD;
- unresolved blockers/human gates;
- invariants / authority boundaries that the next chat must not violate;
- one exact next action;
- explicit instruction to revalidate canonical state before acting.

Prefer references over repetition:

- exact SHA instead of prose such as “latest version”;
- `#77`, `SPEC-017`, `ADR-0025`, file paths and run IDs instead of restating their full content;
- `PASS@<sha>`, `STALE@<sha>`, `PENDING`, `BLOCKED` instead of long verification explanations when the meaning is unambiguous;
- delta-only file/scope notes instead of inventories of unchanged project history.

Do not repeat:

- long architecture background already canonical in docs/ADRs;
- entire specs/plans/tasks;
- old completed milestones that do not constrain the next action;
- verbose explanations of standard workflow rules already referenced by path;
- conversation history that is not needed to reconstruct the current canonical state.

### Caveman handoff format

Normal handoffs SHOULD fit roughly within 250–700 tokens. Correctness overrides the target: exceed it only when necessary to preserve operational information.

Use this compact structure:

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

Omit empty optional lines rather than filling them with prose. Keep `DONE`, `PROOF`, `BLOCK`, `KEEP`, and `NEXT` factual and terse.

### Automatic emission rule

A Caveman handoff MUST be emitted automatically at the end of every material task/cycle even when:

- context is still GREEN;
- the user did not explicitly ask for a prompt;
- work is expected to continue immediately;
- the next task remains in the same repository;
- the current PR is merely waiting for a human merge/gate.

Do not ask permission to generate it. The only exception is an explicit user instruction in the current turn not to produce a handoff/prompt.

## Mandatory triggers

Run this skill when any of the following is true:

- a material task, issue slice, Spec Kit feature, verification cycle, or PR freeze is ending;
- the conversation is moving to another task/workstream;
- context health reaches YELLOW or RED under `docs/ai/context-handoff.md`;
- the chat is near a semantic/context limit and continuation will happen elsewhere;
- a PR was merged or unexpectedly changed while the session was active;
- the user asks for a handoff, continuation prompt, context transfer, or "new chat" prompt.

Do not trigger only because of message count or raw token count.

## Phase A — Reconstruct canonical state

Before writing the handoff, refresh authoritative state instead of trusting conversation history.

Minimum reconstruction:

1. repository and target base (`master` unless explicitly different);
2. active branch/worktree and exact HEAD;
3. issue state and umbrella/parent issue when applicable;
4. PR state, base SHA, head SHA, mergeability and draft state;
5. active Spec Kit feature, tasks and lifecycle step;
6. tier/risk triggers and gate state;
7. relevant ADRs/contracts/architecture;
8. review submissions and unresolved review threads;
9. current CI/workflow runs tied to the exact HEAD;
10. Architecture Graph evidence when required by tier/impact.

If repository state differs from the chat summary, repository state wins and the mismatch must be called out.

## Phase B — Completion audit

Do not ask only "did we implement it?". Audit the task against its own planned proof.

### Scope audit

Compare implementation against:

- issue acceptance criteria;
- `spec.md`;
- `plan.md`;
- `tasks.md`;
- `verification.md` / checklist when present;
- durable contracts and ADRs impacted by the feature.

Classify each expected item as:

```text
DONE | MISSING | PARTIAL | SUPERSEDED | NOT_REQUIRED
```

Do not silently treat an unchecked task as done because code exists.

### Code-quality audit

Inspect changed production/test files for at least:

- TODO/FIXME or temporary scaffolding;
- dead code / unreachable paths;
- fragile selectors or test-only product behavior;
- race conditions / arbitrary sleeps hiding state problems;
- stale route/query state consumed more than once;
- duplicated boundaries or bypassed canonical services;
- error paths that are masked, swallowed, or converted into false success;
- temporary workflows/scripts accidentally left in the diff;
- unexpected changes outside the approved risk envelope.

### Verification audit

Required evidence must be tied to the **same exact relevant HEAD**.

Check, when applicable:

- focused acceptance/regression tests;
- frontend/backend typecheck;
- full unit/integration suite;
- legacy tests;
- production build;
- E2E / Playwright / native smoke required by the feature;
- `sdd:check`;
- Graph/SDD tests;
- `graph:ci`;
- post-implementation Graph impact;
- specialist/adversarial review required by tier;
- human hardware/browser/device smoke that automation cannot replace.

Allowed evidence states:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE
```

Rules:

- A check from an older HEAD is `STALE` if relevant code/docs changed afterward.
- A workflow that is still running is not PASS.
- Skipped jobs are PASS only when the workflow condition makes them explicitly not applicable.
- `|| true`, masked failures, force-clicks, or weakened assertions do not count as evidence.
- If an E2E finds a real product defect, fix the product rather than bypassing the test.

### PR/repository hygiene audit

Confirm:

- PR still targets the expected base;
- base did not advance in a way that invalidates evidence;
- PR remains mergeable;
- no unresolved review threads/reviews block it;
- no temporary verification workflows remain;
- branch contains only the intended task scope;
- human Design/Merge Gate state has not been inferred or fabricated.

## Phase C — Decide closeout state

Use one of these outcomes:

### VERIFIED_COMPLETE

All planned scope is implemented, required evidence is PASS on the exact HEAD, repository hygiene is clean, and only an explicitly human gate/action may remain.

### IMPLEMENTED_NOT_VERIFIED

Implementation appears complete but one or more required checks are running, stale, flaky, blocked, or absent.

### INCOMPLETE

Scope/tasks or required behavior are missing/partial.

### PROCESS_DRIFT

The repository moved unexpectedly (for example PR merged before gate, base changed, branch reused, task closed early). Record the factual state; never invent retroactive approval.

Continue autonomously fixing technical gaps when safe. Stop only for a genuine human gate/blocker.

## Phase D — Produce the handoff package

Generate two artifacts in the response:

1. **Closeout summary** — one compact factual paragraph or Caveman lines with exact HEAD, verification state, blocker/human gate and PR.
2. **Caveman continuation prompt** — automatically emitted paste-ready prompt following the Caveman format above.

Do not emit the legacy full session template by default. `docs/ai/session-handoff-template.md` is a reference/fallback for cases where the compact form cannot safely preserve required information.

The prompt must explicitly instruct the next chat to **verify**, not trust, the handoff.

When detail is necessary, add only the missing operational facts under the relevant Caveman field instead of expanding every section.

Always include language equivalent to:

> Reconstruct canonical state from GitHub/Git/Spec Kit/tests/CI/Graph before acting. Canonical state wins on conflict.

## Gate safety

- A handoff cannot approve a Design Gate.
- A handoff cannot approve a Merge Gate.
- A prior user approval applies only to the clearly presented gate/baseline it approved.
- If Design Baseline SHA changes materially, Design Gate becomes invalid.
- If verified HEAD changes, affected verification must be rerun.
- Never describe a gate as approved retroactively because a PR was merged outside the expected process.

## Task-boundary behavior

At the end of every material task, even if the chat remains GREEN:

1. run the closeout audit;
2. report exact completion/verification status;
3. automatically generate the Caveman continuation prompt;
4. if the next workstream is distinct, require a new branch + new Spec Kit feature (when applicable) + new PR rather than reusing the previous PR.

This makes the end of a task a verification boundary, not merely a conversational summary.

## Context-boundary behavior

When context is YELLOW:

- finish the current safe atomic action;
- refresh canonical state;
- run the closeout audit;
- emit the Caveman handoff before starting materially different work.

When context is RED:

- do not begin another material implementation step;
- finish/stop the current atomic action safely;
- run this skill;
- recommend a new chat;
- emit the Caveman paste-ready prompt.

## Self-check before emitting a handoff

- [ ] Canonical base/branch/HEAD refreshed.
- [ ] Issue/PR state refreshed.
- [ ] Spec Kit/tasks/gates refreshed.
- [ ] Changed files audited.
- [ ] Required tests identified from feature artifacts, not memory.
- [ ] CI result checked on exact HEAD.
- [ ] Graph evidence checked when applicable.
- [ ] Reviews/threads checked.
- [ ] Temporary workflows/scaffolding checked.
- [ ] Missing human evidence called out.
- [ ] No stale check described as PASS.
- [ ] No merge/design approval inferred.
- [ ] Caveman prompt contains exact next action and critical invariants.
- [ ] Caveman prompt is delta-only and avoids redundant project history.
- [ ] New-chat prompt instructs revalidation before action.

## Related canonical policy

Read and follow:

- `AGENTS.md`
- `docs/ai/context-handoff.md`
- `docs/ai/session-handoff-template.md`
- `docs/ai/chatgpt-project-instructions.md`
- `.specify/memory/constitution.md`
