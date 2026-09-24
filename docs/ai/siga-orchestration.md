# SIGA Repository-local Orchestration

## Purpose

SIGA is a repository-local operational continuation protocol. It increases execution guarantees without becoming a central service, project-management database, or replacement lifecycle.

The authority order is mandatory:

```text
REAL STATE > REPOSITORY HANDOFF > MEMORY > CHAT
```

Repository handoffs and SIGA checkpoints are derived resume aids. They never override Git, repository state, specs, code/tests, CI, deployments, or other real systems.

## Portable core

Every SIGA continuation follows one loop:

```text
RECONCILE
   ↓
DECIDE
   ↓
EXECUTE
   ↓
VERIFY
   ↓
PERSIST
```

DECIDE produces exactly one core classification:

```text
RESUME | WATCH | ADVANCE
```

- **RESUME** — work already started is incomplete and safe deterministic work remains.
- **WATCH** — the current owned work has no safe local progress because a verifiable external or human gate is active.
- **ADVANCE** — previous owned work is verified complete, or an unbound session may select exactly one valid independent next task.

Provider-specific session routes may refine these states, but they must map back to this core and must not create a competing lifecycle.

## Capability contract

SIGA core uses abstract capabilities:

```text
git
pull_requests
ci
specs
tests
deploy
worktrees
concurrency
```

A repository-local capability manifest declares which capabilities exist and which local adapter satisfies each one.

The core never assumes GitHub, GitLab, npm, Vercel, Docker, React, Spec Kit, or any other concrete technology. Provider/toolchain names belong only in the local manifest or adapter documentation.

Unsupported capabilities are explicitly disabled. A disabled capability is valid and must not be simulated.

## Minimal operational checkpoint

SIGA carries only the minimum derived state required to resume safely:

```json
{
  "classification": "WATCH",
  "target": "PR-42",
  "reason": "CI_PENDING",
  "head": "abc123",
  "next": "reconcile_ci"
}
```

Required semantics:

- `classification`: RESUME, WATCH or ADVANCE;
- `target`: repository-local task/change/gate identity;
- `reason`: concise evidence-derived reason;
- `head`: exact Git HEAD when Git state is relevant, otherwise `null`;
- `next`: one deterministic next probe/action.

This object is a checkpoint, not a source of truth. Prefer reconstructing it from an existing repository-native lease/handoff sink instead of creating a new mutable state store.

## Idempotent mutation law

Before every mutable action:

```text
observe
-> compare desired state
-> no-op if already satisfied
-> mutate once if needed
-> re-read real state
-> verify
```

Prefer ensure-style semantics:

```text
ensure branch
ensure worktree
ensure PR
ensure lease
ensure handoff
ensure task state
ensure gate state
```

Never repeat a mutation merely because a prior execution was interrupted.

## Error taxonomy

Operational failures use one category:

- **TRANSIENT** — retry only when the operation is safe and idempotent;
- **CONFLICT** — stop mutation and RECONCILE again;
- **BLOCKED** — persist the blocker and deterministic re-probe/action;
- **HUMAN_REQUIRED** — enter WATCH only when no safe autonomous work remains;
- **PERMANENT** — fail with concrete evidence; do not retry blindly.

An error category does not override canonical state.

## WATCH taxonomy

WATCH requires a real, externally verifiable wait condition. Use the most specific reason:

```text
CI_PENDING
REVIEW_PENDING
DEPLOY_PENDING
HUMAN_APPROVAL
EXTERNAL_SERVICE
DEPENDENCY_PENDING
```

Every WATCH checkpoint records how it can be checked again in `next`. "Waiting" without a concrete re-probe is not a valid WATCH.

## Verification

Verification gates are repository-local. SIGA must discover or read them from the local manifest/adapter and evaluate them against the relevant exact state.

Rules:

- running/queued is not PASS;
- stale evidence is not PASS;
- skipped evidence is acceptable only when explicitly not applicable;
- HEAD/base changes can stale prior proof;
- do not copy gates from another repository.

## Concurrency

Concurrency is optional.

```text
concurrency: false
```

is valid when one execution at a time is sufficient.

When concurrency is enabled, the local adapter owns coordination such as leases, locks, worktrees, ownership and dependency rules. The portable core does not require Redis, Kafka, a global database, a shared SIGA repository, or a distributed coordinator.

## OpenBand local binding

This repository binds the portable core through `docs/ai/siga-capabilities.json`.

OpenBand keeps its existing session-router refinements and positive session ownership model. Those are repository-local adapters over the core:

- owned incomplete task -> **RESUME**;
- owned task at a genuine external/human no-safe-work boundary -> **WATCH**;
- verified closeout or unbound independent next-task selection -> **ADVANCE**.

Foreign active sessions are occupancy evidence, not implicit ownership.

The canonical SIGA remains:

`.agents/skills/openband-session-router/SKILL.md`
