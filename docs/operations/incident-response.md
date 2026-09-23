# Incident Response Policy

## Purpose

Provide a vendor-neutral operating procedure for diagnosing OpenBand runtime incidents without granting an agent autonomous production authority.

This policy complements the engineering lifecycle. It does not replace GitHub Issues/PRs, Spec Kit, risk tiers, security review, CI or the evidence-driven Merge Gate.

## Severity

- **SEV-1 — Critical:** broad outage, credible data-integrity risk, or credible security indicator.
- **SEV-2 — Major:** a core creator flow is unavailable or severely degraded without a practical workaround.
- **SEV-3 — Degraded:** bounded impact with a workaround or limited population.
- **SEV-4 — Minor:** low-impact operational defect with no material creator blockage.

Severity follows observed impact. Uncertainty must be stated instead of inflating or minimizing severity.

## Procedure

### 1. Detect

Capture the first-known-bad time, affected surface, environment, signal source and creator-visible symptom.

### 2. Triage

Separate:

- **Observed facts:** health probes, logs, metrics, traces, deployment metadata, CI evidence and reproducible checks.
- **Hypotheses:** possible causes not yet proven by evidence.
- **Unknowns:** evidence that is unavailable, stale or ambiguous.

Missing evidence is not PASS.

### 3. Recommend containment

Prefer reversible, non-mutating diagnostics. A production-changing containment step is only a recommendation until a human explicitly authorizes it.

### 4. Diagnose

Correlate the incident window with deployments, commits, configuration changes and external dependency signals. Correlation is not causation; identify the evidence needed to prove or reject each material hypothesis.

### 5. Remediate

Engineering changes enter the normal `openband-ask` / Spec Kit lifecycle at the risk tier implied by the remediation.

Suspected security incidents escalate to `openband-security`; security-sensitive engineering changes are at least T4.

### 6. Verify

Recovery requires both:

- the operational signal returning to the expected range; and
- the creator-visible or API symptom no longer reproducing.

Record the exact verification window and any remaining uncertainty.

### 7. Close

Close an incident only when the impact is resolved or explicitly accepted, verification evidence is recorded, and follow-up engineering work has a durable owner such as a GitHub issue.

## Authorization matrix

| Action | NOC specialist |
|---|---|
| Read bounded health/log/metric/trace/deploy/CI evidence | Allowed |
| Correlate evidence and recommend diagnostics | Allowed |
| Recommend an engineering issue or Spec Kit remediation | Allowed |
| Rollback or redeploy production | Explicit human approval required |
| Rotate credentials or change access controls | Explicit human approval required |
| Repair, rewrite, delete or migrate production data | Explicit human approval required |
| Disable production services or protections | Explicit human approval required |

A GitHub merge decision never implies authorization for a production mutation.

## Evidence discipline

- Keep observed facts, hypotheses and recommendations visibly separate.
- Preserve timestamps, environment, deployment/commit identity and evidence source when known.
- Do not hide, downgrade or reinterpret `FAIL`, `BLOCKED`, `FLAKY`, stale or missing required evidence.
- Never fabricate a metric, trace, log line, recovery result or causal conclusion.
- Keep sensitive operational data and credentials out of specs, commits, handoffs and generated documentation.

## Escalation

Escalate immediately when evidence suggests:

- credential compromise, unauthorized access or malicious activity;
- possible data corruption/loss;
- cross-runtime or persistence contract failure;
- a remediation that changes a security, persistence, concurrency or privileged automation boundary.

The specialist provides incident evidence; the normal OpenBand risk/lifecycle policy decides the engineering treatment.
