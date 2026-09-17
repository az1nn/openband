---
name: verified-context-handoff
description: Audit canonical project state, verification evidence, completion, and durable continuity before producing one safe token-efficient continuation handoff.
source: project-skill
created_at: '2026-09-17'
---

# Verified Context Handoff

## Purpose

End a material OpenBand task/session without transferring stale assumptions into the next step or chat.

The skill always performs three internal stages in order:

1. **Closeout audit** — prove the actual state from canonical sources.
2. **Durable-context promotion/persistence** — move long-lived facts to canonical docs and persist short-lived continuation state outside the chat.
3. **Caveman handoff** — emit one compact continuation artifact containing only the state needed to resume safely.

This skill is orchestration only. It never overrides Git, Spec Kit, Constitution, `AGENTS.md`, architecture/contracts/ADRs, tests, Architecture Graph, CI, reviews, or human gates.

## Non-negotiable contract

```text
implement -> verify -> classify -> persist -> caveman handoff
```

Caveman Mode is mandatory by default. Do not ask the user whether to enable it and do not require a separate “generate continuation prompt” request.

Caveman Mode is **semantic compression, not verification reduction**:

```text
full audit + full verification -> compressed durable handoff
```

Never substitute:

```text
compressed audit -> compressed confidence
```

Save tokens by removing repeated prose and reconstructable history. Never save tokens by skipping tool checks, tests, CI, Graph evidence, review inspection, freshness checks, or required human gates.

## Mandatory triggers

Run this skill when any of the following is true:

- a material task, issue slice, Spec Kit feature, verification cycle, or PR freeze is ending;
- implementation has reached a stable continuation boundary;
- work is moving to another task/workstream;
- context health reaches YELLOW or RED under `docs/ai/context-handoff.md`;
- a PR was merged or unexpectedly changed while the session was active;
- the user asks for a handoff, continuity prompt, context transfer, or new-chat prompt.

Do not trigger merely because of message count, token count, or number of tool calls.

The only output exception is an explicit user instruction in the current turn not to emit a handoff/prompt. Durable project knowledge must still be promoted when the task requires it.

## Phase A — Reconstruct canonical state

Refresh authoritative state instead of trusting chat history.

Minimum reconstruction when applicable:

1. repository and target base;
2. exact base SHA;
3. active branch/worktree and exact HEAD;
4. issue and umbrella/parent issue;
5. PR state, base, head, draft/mergeability;
6. active Spec Kit feature/tasks/lifecycle;
7. tier/risk triggers and gate state;
8. relevant ADRs/contracts/architecture;
9. reviews and unresolved threads;
10. CI/workflows tied to the exact HEAD;
11. Architecture Graph evidence required by tier/impact.

If canonical state differs from the chat summary, canonical state wins. Record the mismatch only if it matters to closeout or `NEXT`.

## Phase B — Audit completion

### Scope

Compare implementation against the applicable:

- issue acceptance criteria;
- `spec.md`;
- `plan.md`;
- `tasks.md`;
- verification/checklist artifacts;
- durable contracts and ADRs.

Classify expected scope internally as:

```text
DONE | MISSING | PARTIAL | SUPERSEDED | NOT_REQUIRED
```

Do not silently treat unchecked canonical work as complete because code exists.

### Code / change quality

Inspect changed production/test/process files for relevant failure modes, including:

- TODO/FIXME or temporary scaffolding;
- dead/unreachable code;
- fragile or weakened tests;
- arbitrary sleeps / force-clicks / masked failures;
- stale state consumed as current;
- duplicated or bypassed canonical boundaries;
- swallowed errors / false success;
- temporary workflows/scripts left behind;
- changes outside the approved risk envelope.

For documentation/process-only changes, audit for:

- conflicting instructions across canonical surfaces;
- duplicated normative rules likely to drift;
- ambiguous MUST/SHOULD semantics;
- obsolete examples/templates contradicting the new behavior;
- token-saving rules that accidentally weaken verification or gate requirements.

### Verification

Evidence must be tied to the **same exact relevant HEAD**.

Check only what the feature/risk requires, which can include:

- focused acceptance/regression tests;
- typecheck;
- unit/integration/legacy suites;
- production build;
- E2E/native smoke;
- `sdd:check`;
- Graph/SDD tests / `graph:ci`;
- post-implementation Graph impact;
- specialist/adversarial review;
- human browser/device/hardware evidence.

Allowed evidence states:

```text
PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED | STALE
```

Rules:

- evidence from an older relevant HEAD is `STALE`;
- a running/queued workflow is not PASS;
- a skipped job is acceptable only when explicitly not applicable;
- masked failures do not count as proof;
- fix real product/process defects instead of bypassing checks.

### PR / repository hygiene

Confirm when applicable:

- expected base still matches;
- base movement does not invalidate evidence;
- PR remains mergeable;
- no blocking review/thread remains;
- no temporary verification scaffolding remains;
- branch scope is coherent;
- no human gate is inferred or fabricated.

## Phase C — Classify closeout

Use exactly one outcome:

### VERIFIED_COMPLETE

All required scope is complete, required evidence is PASS on the exact relevant HEAD, repository hygiene is clean, and only an explicitly human action may remain.

### IMPLEMENTED_NOT_VERIFIED

Implementation appears complete but required evidence is running, stale, flaky, blocked, or absent.

### INCOMPLETE

Required behavior, scope, or canonical tasks remain missing/partial.

### PROCESS_DRIFT

Repository/process state moved unexpectedly or contradicts the intended lifecycle. Record facts; never invent retroactive approval.

Continue fixing safe technical/process gaps autonomously. Stop only for a genuine human gate or external blocker.

## Phase D — Promote durable knowledge

Chats are short-lived. Before the final handoff, decide which newly learned facts must outlive the current workstream.

Use `docs/ai/durable-context.md`.

Promote long-lived facts to their owning canonical artifact before final verification/freeze:

- architecture/boundary decision -> ADR / architecture docs;
- cross-feature behavioral contract -> `docs/contracts/`;
- workflow/agent rule -> `AGENTS.md`, skill, or AI policy docs;
- feature requirement / acceptance criterion -> active Spec Kit feature;
- implementation behavior -> code + tests;
- constitution-level invariant -> Constitution only when truly constitution-level.

Do not leave a durable project decision only in chat memory, a Caveman block, or a PR comment.

Project/account model memory is optional bootstrap context, not a dependency and not canonical. This skill must remain fully functional when model memory is absent.

## Phase E — Persist operational continuation state

Persist the final Caveman artifact outside the chat using the first safe available sink:

1. **Active PR:** maintain one idempotent top-level PR comment containing `<!-- openband-caveman-handoff -->` plus the latest artifact.
2. **Issue without PR:** maintain one idempotent issue comment using the same marker.
3. **No PR/issue, writable branch:** persist `.qwen/handoffs/<work-key>.md` before final verification/freeze, then verify the resulting HEAD.
4. **No durable sink:** emit the handoff and state durable persistence is unavailable; never pretend chat memory is durable.

Prefer updating the existing marked comment/file rather than appending copies.

### Freeze safety

Persistence must never silently invalidate verification.

- Prefer PR/issue comment persistence after verification because comments do not change Git HEAD.
- A repository handoff-file write changes HEAD; any affected prior verification becomes `STALE`.
- Never create a post-freeze Git commit only to save operational handoff state when a PR/issue comment is available.
- If persistence changes HEAD, rerun required verification before classifying `VERIFIED_COMPLETE`.

Never persist secrets, credentials, private tokens, unnecessary personal data, full logs, or conversation transcripts.

## Phase F — Emit one Caveman artifact

Emit **one** complete handoff artifact. Do not emit a separate closeout summary containing the same facts.

A short preamble is allowed only when needed to explain a blocker, material process drift, persistence failure, or why a clean chat is recommended.

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

Omit empty optional fields instead of filling them with prose.

Normal target: **250–700 tokens**. Correctness overrides the budget.

## Compression policy

Always preserve when applicable:

- repository/base + exact base SHA;
- branch/worktree + exact HEAD;
- issue/PR/Spec identity;
- tier/lifecycle only when relevant to decisions;
- closeout state;
- durable persistence sink;
- current-cycle delta;
- verification evidence + freshness;
- blocker/human gate;
- critical invariant / authority boundary;
- one exact next action;
- verify-first instruction.

Prefer:

- `#77`, `SPEC-017`, `ADR-0025`, exact paths and run IDs;
- `PASS@<sha>`, `STALE@<sha>`, `PENDING`, `BLOCKED`;
- delta-only facts;
- canonical references instead of copied contents.

Do not carry forward:

- full conversation history;
- long architecture background already canonical;
- complete specs/plans/tasks;
- old completed milestones that do not constrain `NEXT`;
- routine unchanged files;
- verbose explanations of standard workflow rules;
- duplicate summaries of facts already encoded in the Caveman block.

If `NEXT` depends on a fact that is neither in the handoff nor recoverable from a named canonical artifact, the handoff is under-specified and must be fixed before emission.

## Caveman lint

Before persisting/emitting, validate the artifact itself:

- [ ] exact base and HEAD are present when Git work exists;
- [ ] closeout classification matches current evidence;
- [ ] no running/queued/stale check is labeled PASS;
- [ ] `PERSIST` identifies the durable operational sink when one exists;
- [ ] `DONE` contains only current-cycle delta;
- [ ] `PROOF` contains only decision-relevant evidence;
- [ ] `BLOCK` names only active blockers/gates;
- [ ] `KEEP` contains only invariants needed to prevent a wrong next action;
- [ ] `NEXT` is one concrete executable action, not a roadmap;
- [ ] verify-first contract is present;
- [ ] no fact is needlessly repeated across sections;
- [ ] no full canonical artifact is copied into the handoff;
- [ ] no gate approval is inferred;
- [ ] long-lived decisions were promoted to canonical docs rather than trapped in the handoff;
- [ ] operational handoff was persisted to the safe durable sink when one exists;
- [ ] persistence did not invalidate the claimed verification HEAD;
- [ ] handoff remains sufficient if chat history and model memory disappear.

## Gate safety

- A handoff cannot approve a Design Gate.
- A handoff cannot approve a Merge Gate.
- A prior user approval applies only to the baseline/gate clearly presented at that time.
- If Design Baseline SHA changes materially, Design Gate becomes invalid.
- If verified HEAD changes, affected verification becomes stale and must be rerun.
- A merged PR does not retroactively create a missing gate approval.

## Task and context boundaries

At the end of every material task, even when context is GREEN:

1. run full closeout audit;
2. classify state;
3. promote durable knowledge;
4. persist operational Caveman state;
5. emit the same Caveman handoff automatically;
6. if the next workstream is distinct, require a new branch + new Spec Kit feature when applicable + new PR rather than reusing the previous PR.

At YELLOW:

- finish the current safe atomic action;
- refresh canonical state;
- close out;
- persist + emit Caveman before materially different work.

At RED:

- do not begin another material implementation step;
- finish/stop the current atomic action safely;
- close out;
- persist Caveman;
- recommend a clean chat;
- emit Caveman.

## Related canonical policy

Read and follow:

- `AGENTS.md`
- `docs/ai/context-handoff.md`
- `docs/ai/durable-context.md`
- `docs/ai/session-handoff-template.md`
- `docs/ai/chatgpt-project-instructions.md`
- `.specify/memory/constitution.md`
