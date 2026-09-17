# Durable Context Policy

## Purpose

OpenBand sessions are intentionally short-lived. Conversation state is useful working context, not durable project memory.

Durable continuity must live in repository/GitHub artifacts that a new session can reconstruct without replaying chat history.

This policy separates **durable knowledge** from **operational handoff state** and prevents handoff persistence from invalidating a verified Git HEAD.

## Authority

Durable context never creates a new source of truth.

Canonical authority remains:

```text
Constitution
> current architecture / ADR / durable contract
> approved feature spec
> plan
> tasks
> code/tests/Git state
```

Architecture Graph, handoffs, comments, generated plans, execution records and chat memory are derived context.

## Task-lifecycle prerequisite

Operational handoff persistence happens only after the active task reaches a genuine closeout boundary under `docs/ai/context-handoff.md`.

If safe autonomous work remains, `.qwen/skills/auto-skill-continue-work/SKILL.md` owns continuation and no Caveman artifact should be persisted yet.

`.qwen/skills/auto-skill-caveman-handoff/SKILL.md` owns final closeout persistence/emission.

## Two persistence classes

### 1. Durable project knowledge

If a fact must remain true after the current task or PR, promote it into the canonical artifact that owns that fact before final verification.

Examples:

- architecture/boundary decision -> ADR / architecture docs;
- cross-feature behavioral contract -> `docs/contracts/`;
- workflow/agent rule -> `AGENTS.md`, skill or AI policy docs;
- feature requirement / acceptance criterion -> active Spec Kit feature;
- implementation behavior -> code + tests;
- project invariant -> Constitution only when constitution-level.

Do not hide durable decisions only inside a Caveman handoff, PR comment, issue comment or chat memory.

### 2. Operational continuation state

Short-lived facts required to resume after task closeout belong in a Caveman handoff, for example:

- branch/base + exact SHAs;
- issue/PR/Spec identity;
- closeout classification;
- current-cycle delta;
- verification freshness;
- blockers/human gates;
- one exact `NEXT` action.

This state is derived and must be revalidated by the next session.

## Persistence sink order

At eligible task closeout, `caveman-handoff` must persist the final artifact using the first safe available sink:

1. **Active PR:** maintain one idempotent top-level PR comment containing `<!-- openband-caveman-handoff -->` and the latest Caveman artifact.
2. **Issue without PR:** maintain one idempotent issue comment using the same marker.
3. **No PR/issue but writable branch:** persist to `.qwen/handoffs/<work-key>.md` **before** final verification, then verify the resulting HEAD.
4. **No durable sink available:** emit the artifact in the response and state `PERSIST: unavailable`. Do not pretend chat memory is durable.

Prefer updating the existing marked comment/file instead of appending copies.

## Freeze safety

Persisting context must not silently invalidate verification.

Rules:

- PR/issue comment persistence is preferred after verification because it does not mutate Git HEAD.
- A repository handoff file written after verification changes HEAD; affected verification becomes `STALE` and must be rerun.
- Never call a previous SHA verified after a persistence commit changed the branch.
- Do not create a post-freeze documentation commit only to store operational state when a PR/issue comment is available.

## Baseline failure triage

A failed closeout check does not automatically mean the active branch caused the defect.

When a required check fails outside changed scope or in behavior shared by multiple independent PRs:

1. keep the active work `IMPLEMENTED_NOT_VERIFIED`; never relabel the failure as PASS or ignore it;
2. compare the failure with current `master` / target-base lineage and another independent run when available;
3. classify the defect as branch regression only when evidence ties it to the active diff;
4. if evidence proves a baseline defect, create an isolated issue + branch + PR instead of contaminating the original feature PR;
5. fix the product/process defect without weakening the failing test;
6. verify and land the baseline fix under its own evidence;
7. mark prior evidence for the original PR `STALE` when target base changes;
8. rerun the original PR against corrected base before merge.

A baseline defect is a blocker, not an excuse to bypass assurance. If those remediation steps are safe and available now, `continue-work` should perform them before Caveman closeout. Caveman may record the blocker only when no safe autonomous progress remains.

## Handoff comment contract

The durable PR/issue comment should contain only:

```text
<!-- openband-caveman-handoff -->
CAVEMAN HANDOFF v1
...
```

It may include a short machine-readable footer:

```text
SOURCE_HEAD: <sha>
UPDATED_AT: <ISO-8601 timestamp when available>
```

The marker exists so agents update one durable record instead of creating comment spam.

## Promotion rule

Before persisting operational state, ask:

> If the next chat disappeared too, would this fact still need to govern the project after this workstream ends?

If yes, promote the fact to its canonical artifact first. The handoff may then reference that artifact by path/ID instead of duplicating contents.

## Memory rule

Product/account memory may help bootstrap a session but is optional, non-canonical and not required for continuity.

The `continue-work` and `caveman-handoff` skills must therefore remain fully functional without model memory. Repository/GitHub persistence is the durable fallback and preferred project-memory substrate.

Never persist secrets, credentials, private tokens, unnecessary personal data, full logs or large conversation transcripts in durable context.

## New-session bootstrap

A fresh session should:

1. reconstruct current GitHub/Git state;
2. read `AGENTS.md` and active Spec Kit artifacts;
3. read the latest marked Caveman record when useful;
4. revalidate every decision-relevant fact against canonical state;
5. treat mismatches as stale handoff data;
6. continue from `NEXT` only after freshness and applicable human gates are proven.
