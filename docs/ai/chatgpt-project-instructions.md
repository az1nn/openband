# ChatGPT Project Instructions — OpenBand

This file is the repository-owned source for the ChatGPT Project instructions used when working on OpenBand.

Repository: `https://github.com/az1nn/openband`

For OpenBand development work, Git-backed code, GitHub Spec Kit artifacts, Constitution, `AGENTS.md`, architecture, contracts, ADRs, tests and Git history are canonical.

At the beginning of a material development session:

1. Refresh repository, branch, worktree, issue and PR state.
2. Read `AGENTS.md`.
3. Follow `docs/ai/context-handoff.md`.
4. Reconstruct context progressively:

```text
L0  Constitution + AGENTS + feature/tier
L1  feature spec + impacted architecture/contracts/ADRs + Graph
L2  relevant code + tests + specialists
```

Do not load the entire repository or previous conversation history by default.

At the end of every material task, feature slice, verification cycle, PR freeze, or before moving to a distinct workstream, run `.qwen/skills/auto-skill-verified-context-handoff/SKILL.md`.

The closeout is mandatory even when the conversation remains GREEN. It must refresh canonical state, audit planned scope versus implementation, verify required tests/CI/Graph on the exact relevant HEAD, inspect reviews and temporary scaffolding, and classify the task as `VERIFIED_COMPLETE`, `IMPLEMENTED_NOT_VERIFIED`, `INCOMPLETE`, or `PROCESS_DRIFT`.

After the full audit, automatically emit one compact Caveman handoff. Do not require the user to separately ask for a continuation prompt. Caveman Mode saves tokens by compressing the transferred context, never by skipping reasoning, tests, CI, Graph checks, review inspection, or gate validation.

The Caveman handoff must preserve, when applicable:

- repository and exact base SHA;
- working branch/worktree and exact HEAD;
- issue / PR / Spec Kit identity;
- closeout state;
- current-cycle implementation delta;
- exact-HEAD verification evidence and freshness;
- blockers and human gates;
- critical invariants / authority boundaries;
- one exact next action;
- explicit verify-first instruction.

Prefer IDs, SHAs, run IDs and canonical paths over narrative. Do not repeat entire specs, plans, ADRs, architecture, logs, or old completed milestones. Do not duplicate the same closeout facts in a prose summary and a second handoff block unless extra explanation is necessary to avoid ambiguity.

Continuously monitor conversation context health without reporting the status on every response.

Use:

- GREEN — context remains coherent and trustworthy; continue normally. A material task closeout still emits Caveman automatically.
- YELLOW — a semantic boundary is approaching; finish the current safe atomic lifecycle action, refresh canonical state, and run verified closeout.
- RED — continuing the current chat materially increases the risk of stale, contradictory, superseded or ambiguous context; finish/stop the current safe atomic action, run verified closeout, emit Caveman, and recommend a clean chat.

Conversation length, message count or number of tool calls alone must never trigger a chat change.

Potential boundaries include:

- Design Gate reached or approved;
- implementation slice completed;
- converge/implement cycle completed;
- verification/freeze completed;
- PR merged;
- new Spec Kit feature or materially different workstream starting;
- stacked dependency landed and dependent work requires revalidation;
- branch, PR, feature, ADR or task state becoming difficult to distinguish;
- old logs, diffs, exploration or failed approaches dominating useful context;
- repository HEAD advancing enough that the conversation is no longer a trustworthy implementation snapshot.

When RED, explicitly tell the user:

> ⚠️ **Context boundary recommended — good moment to start a new chat.**

Do not abandon a safe atomic action already in progress. Finish or explicitly stop the current lifecycle step first.

Then emit the Caveman artifact defined by `docs/ai/session-handoff-template.md`.

A handoff cannot:

- approve a Design Gate;
- mark verification as PASS without current evidence;
- authorize a T2+ merge;
- override risk tier;
- override Spec Kit state;
- override current Git/PR state;
- retroactively approve a gate because a PR was merged outside the expected process.

If the Design Baseline SHA changed, treat the Design Gate as invalid until re-analysis and human approval.

If verified HEAD changed, rerun affected verification before considering the Merge Gate satisfied.

For T2+ work, preserve the OpenBand lifecycle:

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

Changing chats never resets, skips or satisfies any lifecycle gate.
