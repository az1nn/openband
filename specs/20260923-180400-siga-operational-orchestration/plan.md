# Plan — Repository-local SIGA Operational Orchestration

## Classification

**Tier:** T3  
**Issue:** #112  
**Base:** `master@e1f75b731ea6e95cffd2b05377890b49fb9c087e`  
**ADR:** NOT REQUIRED — this refines the existing repository-local agent/session coordination boundary. It introduces no product/runtime service, persistent database, cross-runtime product contract, or new deployment topology. Durable orchestration semantics remain owned by agent policy/docs plus the canonical SIGA skill.

## Current-state diagnosis

The repository already has a mature OpenBand-specific session router with:

- hard repository identity lock;
- canonical SIGA skill + compatibility adapter;
- positive session ownership via idempotent lease comments;
- foreign-session occupancy handling;
- evidence-first routing and exact-HEAD freshness rules;
- Caveman handoff persistence;
- existing concurrent-session coordination.

The missing pieces relative to the requested repository-local orchestrator are:

1. no explicit capability manifest separating generic SIGA capability names from OpenBand adapters;
2. no single documented core mapping to RESUME / WATCH / ADVANCE;
3. no minimal machine-readable operational checkpoint schema;
4. no formal error taxonomy;
5. no formal WATCH reason taxonomy + re-probe contract;
6. idempotency is present in selected places but not stated as a universal mutation rule;
7. verification gates are discovered operationally but not declared in one repository-local adapter contract;
8. no regression test that locks these guarantees together.

## Design

### 1. Keep the canonical entrypoint

Do not create `.siga/`, a Maestri project, a server, or a second canonical skill.

`.agents/skills/openband-session-router/SKILL.md` remains canonical.

### 2. Add repository-local orchestration contract

Create `docs/ai/siga-orchestration.md` defining the portable core:

```text
RECONCILE -> DECIDE -> EXECUTE -> VERIFY -> PERSIST
                |
                +-> RESUME | WATCH | ADVANCE
```

The document defines generic capability, checkpoint, idempotency, WATCH and error semantics without assuming a provider/toolchain.

### 3. Add local capability/adapter manifest

Create `docs/ai/siga-capabilities.json` with:

- protocol version;
- capability booleans;
- adapter identifiers for repository/PR/CI/spec/tests/deploy/worktree/concurrency surfaces;
- exact repository-local verification gates;
- concurrency mode.

For OpenBand, concurrency is enabled because the existing session-lease model explicitly supports multiple independent sessions. This does not create distributed infrastructure.

### 4. Map existing OpenBand routes onto core classification

Preserve current user-visible session routes while formalizing the core classification:

- owned unfinished work -> RESUME;
- owned work with no safe local progress and a verifiable external/human gate -> WATCH;
- completed prior work or unbound independent task selection -> ADVANCE;
- foreign active/waiting sessions are occupancy evidence, not implicit ownership.

### 5. Minimal checkpoint schema

Define an example/contract containing:

```json
{
  "classification": "WATCH",
  "target": "PR-42",
  "reason": "CI_PENDING",
  "head": "abc123",
  "next": "reconcile_ci"
}
```

Persist it only through existing lease/handoff sinks. Do not create an independent mutable status database/file.

### 6. Idempotent mutation contract

For every mutation:

```text
observe -> compare desired state -> no-op if satisfied -> mutate once -> re-read -> verify
```

Apply to branch, worktree, PR, lease, handoff, task state and external gate state when the adapter can inspect them.

### 7. Error and WATCH taxonomies

Errors:

```text
TRANSIENT | CONFLICT | BLOCKED | HUMAN_REQUIRED | PERMANENT
```

WATCH reasons:

```text
CI_PENDING | REVIEW_PENDING | DEPLOY_PENDING | HUMAN_APPROVAL | EXTERNAL_SERVICE | DEPENDENCY_PENDING
```

Each WATCH records a deterministic re-probe.

### 8. Policy regression test

Extend the already-executed `tests/governance-policy.test.mjs` suite so the unchanged `test:graph-sdd` gate proves:

- canonical skill remains unique;
- authority ordering exists;
- RESUME/WATCH/ADVANCE exist;
- capability manifest is valid and repository-local;
- generic orchestration doc does not hard-code unsupported universal stack requirements;
- no Maestri/central runtime is introduced by the orchestration contract.

## Architecture / dependency impact

The change touches repository-local SIGA skills/docs/tests only. It does not modify product code, persistence, bridge APIs, deployment topology, privileged merge policy, `AGENTS.md`, `scripts/sdd-policy-check.mjs`, or CI/package evidence-producer wiring.

The Architecture Graph is still required because agent policy surfaces are shared governance context; Graph/SDD evidence must remain green.

## Rollback

Revert the #112 PR. Existing session routing remains usable because the implementation extends the current canonical skill rather than replacing it.

## Verification strategy

Exact candidate HEAD must pass:

- `npm run sdd:check`;
- `npm run test:graph-sdd`, including the SIGA assertions added to the existing governance-policy test;
- `npm run graph:ci`;
- the repository's standard exact-HEAD CI jobs listed in `openband.json`;
- PR review/thread and mergeability checks;
- final audit that no second canonical SIGA exists and no central runtime was added.
