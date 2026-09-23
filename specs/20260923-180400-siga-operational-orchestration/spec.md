# Feature: Repository-local SIGA Operational Orchestration

**Tier:** T3 — agent orchestration/governance boundary  
**Issue:** #112

## Goal

Evolve the existing canonical SIGA in this repository into a stronger repository-local operational orchestrator without creating a second lifecycle, central service, global state store, or cross-repository coordinator.

## Authority

The implementation MUST preserve this ordering:

```text
REAL STATE > REPOSITORY HANDOFF > MEMORY > CHAT
```

Git, GitHub state, Spec Kit artifacts, code/tests, CI and other real systems remain authoritative. SIGA state is derived coordination/checkpoint data only.

## Core flow

The canonical operational loop remains:

```text
RECONCILE -> DECIDE -> EXECUTE -> VERIFY -> PERSIST
```

Every continuation MUST produce exactly one operational classification:

```text
RESUME | WATCH | ADVANCE
```

Session ownership routing may retain OpenBand-specific refinements such as ACTIVE/OWNED and foreign-session occupancy, but those refinements MUST map cleanly to the three core classifications rather than replacing them.

## Requirements

- **FR-001 — Single canonical SIGA.** The existing `.agents/skills/openband-session-router/SKILL.md` remains the sole canonical SIGA entrypoint. Compatibility paths may delegate only.
- **FR-002 — Capability manifest.** SIGA MUST declare repository-local capabilities explicitly and separate generic capability names from concrete local adapters.
- **FR-003 — Explicit checkpoint state.** SIGA MUST define a minimal derived operational checkpoint with classification, target, reason, exact HEAD when applicable, and next deterministic probe/action.
- **FR-004 — Idempotency.** Mutating operations MUST check desired state first and use ensure-style semantics where possible. A resumed execution MUST NOT blindly duplicate branches, PRs, leases, handoffs, task records or gate state.
- **FR-005 — Error taxonomy.** Operational failures MUST classify as TRANSIENT, CONFLICT, BLOCKED, HUMAN_REQUIRED or PERMANENT, with deterministic handling.
- **FR-006 — WATCH taxonomy.** External wait states MUST distinguish CI_PENDING, REVIEW_PENDING, DEPLOY_PENDING, HUMAN_APPROVAL, EXTERNAL_SERVICE and DEPENDENCY_PENDING when applicable, and record how to re-probe them.
- **FR-007 — Real verification gates.** The local adapter MUST enumerate only gates that actually exist in this repository; generic SIGA policy MUST NOT hard-code GitHub, npm, Vercel, React, Docker or Spec Kit as universal requirements.
- **FR-008 — Concurrency is local and optional.** The generic protocol MUST allow concurrency to be disabled. OpenBand MAY enable it because the repository already supports simultaneous task sessions through session leases and isolated branches/worktrees.
- **FR-009 — No new source of truth.** Capability/config/checkpoint files MUST be descriptive/derived. They MUST NOT override Git, GitHub, Spec Kit, CI or repository policy.
- **FR-010 — No heavy runtime.** No SIGA server, Maestri project/service, Redis, Kafka, global database, shared SIGA repository or distributed runtime may be introduced.
- **FR-011 — Repository-local persistence.** Durable SIGA policy/configuration remains in this repository; short-lived continuation state continues to use existing idempotent PR/issue handoffs/leases when available.
- **FR-012 — Regression proof.** Automated policy tests MUST reject duplicated canonical SIGA ownership, missing core classifications, missing authority ordering, and adapter leakage into the generic core.

## Non-goals

- redesigning Spec Kit;
- changing evidence-driven merge semantics;
- changing product/runtime behavior;
- replacing GitHub Issues/PRs as operational demand/integration state;
- creating cross-repository orchestration.
