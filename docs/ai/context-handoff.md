# Conversation Context Handoff Policy

## Purpose

This policy defines when an AI-assisted OpenBand work session should remain in the current chat and when it should hand off to a clean chat.

It does **not** create a new workflow engine, project state machine, or source of truth. OpenBand's Spec Kit lifecycle, Git state, Architecture Graph, ADRs, contracts, code, tests, and human gates remain authoritative.

## Core rule

Do not change chats because a conversation is merely long. Change chats when the current conversation stops being a reliable bounded implementation context.

A session continuously classifies its context health as:

```text
GREEN  coherent and trustworthy enough to continue
YELLOW approaching a semantic boundary; finish the current atomic step
RED    continuing materially increases stale/conflicting-context risk
```

The state is normally internal. Only YELLOW or RED needs to be surfaced when useful.

## GREEN

Continue in the current chat when:

- one coherent issue / Spec Kit feature / engineering objective still dominates the session;
- active branch, worktree, PR, feature, tier and gate state are unambiguous;
- current decisions are distinguishable from superseded exploration;
- required repository facts can be refreshed cheaply from Git/Graph rather than replayed from chat history;
- the conversation is helping rather than competing with canonical project artifacts.

Length alone never turns GREEN into YELLOW or RED.

## YELLOW

YELLOW means a natural handoff boundary is approaching but the current atomic action should usually finish first.

Typical signals:

- a Design Gate, implementation slice, convergence cycle, verification cycle, or PR freeze is near completion;
- the session is about to move to a materially different workstream or Spec Kit feature;
- accumulated logs, failed approaches, diffs, screenshots, or tool output are becoming larger than the context needed for the next step;
- several branches, stacked PRs, ADR revisions, or task states are now being discussed together;
- repository state has moved substantially since the session began.

At YELLOW:

1. do not interrupt a safe atomic action;
2. finish or explicitly stop the current lifecycle step;
3. refresh canonical state before deciding whether RED is warranted;
4. prefer a semantic milestone over an arbitrary token/message threshold.

## RED

Use RED when continuing the current chat materially increases the risk of acting on stale, contradictory, superseded, or ambiguous context.

Strong RED signals include:

- branch / PR / Spec Kit feature / gate state is being confused or repeatedly re-established;
- superseded architecture or requirements are being treated as current;
- settled questions are being asked again because the session can no longer recover their authoritative answer reliably;
- a completed workstream is giving way to a new materially different workstream;
- the repository has advanced enough that chat history is no longer a trustworthy implementation snapshot;
- the next action would require replaying substantial conversation history instead of reconstructing bounded context from canonical artifacts;
- stale generated context packages, graph output, plans, or prior verification evidence risk being reused after HEAD changed.

When RED, explicitly say:

> ⚠️ **Context boundary recommended — good moment to start a new chat.**

Complete any safe atomic action already in progress first. Then generate a `SESSION_HANDOFF.md` using `docs/ai/session-handoff-template.md`.

## Handoff contract

A handoff represents **final state**, not conversation history.

It must contain only context needed to resume safely:

- objective;
- repository / branch / worktree / PR / issue state;
- active Spec Kit feature and lifecycle step;
- risk tier and relevant triggers;
- Design Gate / Merge Gate status and approved baseline SHA when applicable;
- final decisions;
- explicitly superseded decisions that must not be reused;
- completed work;
- canonical artifacts and Architecture Graph evidence worth reloading;
- verification evidence and its HEAD/freshness boundary;
- blockers / open questions;
- exact next action;
- minimal new-chat bootstrap instructions.

Do not paste full transcripts, long logs, or speculative history into the handoff.

## Freshness rules

A handoff is derived context. It never overrides canonical state.

A new chat must verify, at minimum:

1. repository and current `master` / target base;
2. active branch/worktree and expected HEAD;
3. issue and PR state;
4. active Spec Kit feature and tasks;
5. relevant ADRs/contracts/architecture;
6. Architecture Graph evidence when available;
7. whether the approved Design Baseline SHA or verification HEAD still matches the state being acted on.

If the handoff conflicts with Git, Spec Kit, ADRs, contracts, tests, or current PR state, canonical repository state wins and the mismatch must be called out.

## Relationship to OpenBand context levels

The handoff is not an extra context level. It is a bootstrap hint for reconstructing the existing progressive model:

```text
L0  Constitution + AGENTS + feature/tier
L1  feature spec + impacted architecture/contracts/ADRs + Graph
L2  relevant code + tests + specialists
```

A fresh chat should reconstruct the smallest sufficient L0 → L1 → L2 context instead of importing the previous chat wholesale.

## Gate safety

A new chat does not reset or bypass lifecycle gates.

- A handoff cannot grant a Design Gate.
- A handoff cannot mark verification PASS.
- A handoff cannot authorize a T2+ merge.
- If a Design Baseline SHA changed, the existing Design Gate is invalid until re-analysis and human approval.
- If verified HEAD changed, affected checks must be rerun before Merge Gate.

## Recommended semantic boundaries

Good handoff points include:

- Design Gate approved and implementation is about to start in a fresh execution session;
- an implementation slice converged and the next slice has a different objective;
- PR verification/freeze completed and a new PR/workstream is next;
- a feature is merged and the next roadmap item starts;
- a stacked dependency landed and dependent work must be rebased/revalidated;
- a major architecture exploration concluded and the approved design has been materialized canonically.

Do not hand off merely because many messages or tool calls occurred.
