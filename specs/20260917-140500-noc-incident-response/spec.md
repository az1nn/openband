# Feature: NOC and Incident-Response Agent Layer

**Tier:** T2 — bounded engineering capability
**Issue:** #79

## Goal

Add a focused operational specialist that can interpret production evidence, classify incidents, correlate regressions with deployments, and recommend safe next actions without creating a second lifecycle or autonomously mutating production.

## Requirements

- **FR-001** `openband-noc` is a specialist under the existing Spec Kit / OpenBand agent policy, not an independent orchestrator.
- **FR-002** The specialist consumes bounded operational evidence such as health checks, logs, metrics, traces, deployment metadata and CI status; it must distinguish observed evidence from hypotheses.
- **FR-003** Incident output records severity, affected surface, evidence, likely change window, recommended next action and confidence/uncertainty.
- **FR-004** Production-changing actions such as rollback, redeploy, credential rotation, data repair or disabling a service require explicit human approval in this first slice.
- **FR-005** Suspected security incidents are handed to `openband-security` and treated as at least T4 when engineering changes are required.
- **FR-006** A durable incident-response policy defines detection → triage → containment recommendation → diagnosis → remediation → verification → closure.
- **FR-007** An initial API-regression runbook shows how to correlate elevated errors/latency with a deployment and produce actionable evidence.
- **FR-008** The design remains vendor-neutral; no observability provider is required by this feature.
- **FR-009** NOC-generated remediation must re-enter the canonical engineering lifecycle and may never bypass required merge evidence or policy checks.

## Acceptance

1. An agent can distinguish code/security review from runtime operational triage.
2. A simulated post-deploy HTTP 5xx/latency regression can be processed into a structured incident report and safe recommendation.
3. The NOC specialist cannot autonomously rollback, redeploy or perform destructive production actions in this slice.
4. Security indicators trigger escalation rather than being treated as ordinary availability incidents.
5. Existing T0–T4, human Design Gate and verification semantics remain authoritative; merge behavior follows the canonical project Merge Gate rather than NOC-specific rules.
6. NOC remediation cannot suppress, skip or reinterpret required merge evidence.
7. No product/runtime behavior changes in this first slice.