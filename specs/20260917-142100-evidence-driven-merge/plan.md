# Plan: Evidence-Driven Merge Gate

## Approach

Keep human approval at the Design Gate, but make merge eligibility a deterministic evidence contract. The merge gate evaluates the exact candidate HEAD plus base freshness and fails closed whenever required proof is absent or unreliable.

## Live governance surfaces

1. Amend `.specify/memory/constitution.md` so PR-first governance requires human Design Gate for T2+ and evidence-driven Merge Gate for all tiers.
2. Reconcile `AGENTS.md` risk table, lifecycle diagram, verification semantics and merge behavior.
3. Reconcile `CONTRIBUTING.md` so contributors understand automatic merge eligibility and exact-HEAD evidence.
4. Reconcile `.agents/skills/openband-ask/SKILL.md` so the router stops at Design Gate but does not wait for a human Merge Gate.
5. Reconcile `docs/ai/chatgpt-project-instructions.md`, `docs/ai/context-handoff.md` and `docs/ai/session-handoff-template.md` with the new gate states.
6. Do not rewrite historical feature specs; they remain records of the policy in force when authored.

## Merge contract

A PR is merge-eligible only when all of the following are true:

- the exact candidate HEAD has current verification evidence;
- every risk-derived required check is `PASS` or justified `NOT_REQUIRED`;
- no required evidence is `FAIL`, `BLOCKED` or `FLAKY`;
- required specialist reviews/policies are satisfied;
- acceptance/regression coverage exists for behavior whose breakage would matter;
- the target branch relationship is fresh enough that prior evidence remains valid, otherwise the candidate is refreshed and affected checks rerun;
- there are no unresolved policy violations or known contradictions between spec, implementation and verification evidence.

Automatic merge is the action after this contract is satisfied. Auto-merge must not bypass checks, reinterpret skipped checks as success, or treat CI completion alone as proof if the risk-derived contract requires more.

## Risk behavior

- **T0/T1:** focused regression evidence may be sufficient.
- **T2:** approved Design Baseline + acceptance/regression evidence + required CI/policy checks.
- **T3:** T2 evidence + architecture/contract impact checks + required specialists.
- **T4:** T3 evidence + adversarial/security/recovery/concurrency or other domain-specific proof required by the risk trigger.

All tiers may auto-merge after their own evidence contract is satisfied. Higher tiers therefore increase assurance requirements, not manual merge ceremony.

## Verification

- run `npm run sdd:check`;
- run `npm run test:graph-sdd` and `npm run graph:ci`;
- search all live governance surfaces for stale `human Merge Gate`, `READY_FOR_HUMAN`, and equivalent semantics;
- verify historical `specs/` are not modified except this feature;
- verify Design Gate remains human for T2+;
- verify fail-closed states and exact-HEAD freshness remain explicit;
- verify CI/workflow behavior does not claim auto-merge is enabled unless repository settings/tooling actually support it.

## Architecture Decision

This is a constitution/governance amendment rather than runtime architecture. No ADR is required; the canonical durable change is the constitution plus live agent/governance surfaces.