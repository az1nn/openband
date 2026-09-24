# Plan: NOC and Incident-Response Agent Layer

## Approach

Extend the existing specialist model with an operational/NOC reviewer. Keep orchestration, risk classification, automated design validation and merge eligibility owned by the canonical Spec Kit/OpenBand governance rather than creating NOC-specific lifecycle rules.

The prior dependency on the evidence-driven merge feature is satisfied by merged #81 / PR #82. The dependency remains declared as feature provenance; this branch must still reconcile with current `master` and pass current automated design/policy validation before implementation.

## Changes

1. Add `.agents/skills/openband-noc/SKILL.md` as a read-mostly operational specialist.
2. Add `docs/operations/incident-response.md` with severity, evidence, escalation and production-action approval rules.
3. Add `docs/operations/runbooks/api-regression.md` as the first concrete runtime runbook.
4. Reconcile `AGENTS.md` specialist guidance only if a direct reference improves discoverability without duplicating policy.
5. Do not add an observability vendor, autonomous rollback or production credentials in this slice.

## Operational contract

The NOC specialist may:
- read supplied/available operational evidence;
- correlate incident timing with deploys and code changes;
- classify impact and propose containment/remediation;
- open or enrich engineering work when tooling/authorization exists.

The NOC specialist may not, without explicit human approval:
- rollback/redeploy production;
- rotate credentials or alter access controls;
- repair/delete production data.

The NOC specialist may never:
- suppress required checks to restore green status;
- bypass the canonical evidence-driven Merge Gate;
- reinterpret `FAIL`, `BLOCKED` or `FLAKY` evidence as success.

Security indicators escalate to `openband-security`; code remediation re-enters the normal risk-tier lifecycle. Merge eligibility follows the project-wide exact-HEAD evidence contract.

## Risk and architecture

Tier remains **T2** because this slice adds bounded engineering-operational policy, a specialist skill and runbook documentation only. It does not change runtime architecture, persistence, cross-runtime contracts, production credentials, deployment topology or autonomous production mutation.

ADR: **NOT REQUIRED** for this first slice. A later telemetry transport, persistent incident store, production credential integration or autonomous remediation mechanism requires separate architecture/risk assessment.

## Verification

The schemaVersion 2 evidence contract requires:
- `graph-check`;
- `security-policy`;
- `frontend-typecheck`;
- `backend-typecheck`;
- `vitest`;
- `legacy-tests`;
- `web-build`;
- `web-launch-e2e`;
- `merge-gate`.

Feature-specific review must additionally:
- inspect the NOC skill against `AGENTS.md` and the Constitution for lifecycle duplication or weakened gates;
- walk the API-regression scenario and verify output separates observed facts, hypotheses and recommended actions;
- confirm no runtime/product files changed;
- confirm all production-changing actions remain explicitly human-authorized;
- confirm NOC remediation cannot bypass or weaken required merge evidence.
