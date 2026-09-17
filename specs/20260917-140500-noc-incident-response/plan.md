# Plan: NOC and Incident-Response Agent Layer

## Approach

Extend the existing specialist model with an operational/NOC reviewer. Keep orchestration, risk classification and human gates owned by the current Spec Kit/OpenBand policy.

## Changes

1. Add `.agents/skills/openband-noc/SKILL.md` as a read-mostly operational specialist.
2. Add `docs/operations/incident-response.md` with severity, evidence, escalation and human-approval rules.
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
- repair/delete production data;
- merge T2+ changes;
- suppress required checks to restore green status.

Security indicators escalate to `openband-security`; code remediation re-enters the normal risk-tier lifecycle.

## Verification

- run `npm run sdd:check`;
- run `npm run test:graph-sdd` and `npm run graph:ci` if the feature metadata/docs affect graph policy;
- inspect the NOC skill against `AGENTS.md` for lifecycle duplication or weakened gates;
- walk the API-regression scenario and verify the output separates facts, hypotheses and recommended actions;
- confirm no runtime/product files changed.

## Architecture Decision

ADR: **NOT REQUIRED** for this first slice. The feature adds an engineering-operations specialist and runbook policy without changing runtime architecture. A later telemetry transport, persistent incident store or autonomous remediation mechanism requires separate architecture assessment.