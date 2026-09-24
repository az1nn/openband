# API Regression Runbook

## Use when

Use this runbook for a post-deploy API regression such as elevated HTTP 5xx rate, increased latency, health-check failure or a creator-visible API error.

The runbook is diagnostic. It does not authorize rollback, redeploy, credential changes or production data mutation.

## Inputs

Collect what is available:

- environment and affected endpoint/route;
- first-known-bad timestamp and comparison baseline;
- response/error rate and latency signal;
- health-check results;
- relevant logs/traces with sensitive values redacted;
- current deployment/commit identity and deployment timestamp;
- recent CI status and known dependency incidents.

Mark unavailable inputs as **unknown** rather than inventing substitutes.

## Steps

1. **Confirm the signal**
   - verify the regression appears in at least one trustworthy operational source;
   - compare against a recent healthy baseline using the same metric definition.
2. **Bound the impact**
   - identify affected endpoint, population, environment and creator-visible symptom;
   - assign SEV level from `docs/operations/incident-response.md`.
3. **Correlate the change window**
   - compare first-known-bad time with deployment/commit/config/dependency events;
   - treat timing overlap as correlation only.
4. **Isolate likely domains**
   - application errors: inspect matching error classes and traces;
   - saturation: inspect latency, queueing, CPU/memory/connection pressure when available;
   - dependency failure: compare upstream/downstream health and timeout patterns;
   - deployment regression: compare behavior before/after the candidate revision.
5. **Recommend the smallest safe next action**
   - add a focused diagnostic or reproduction;
   - if code repair is needed, open/resume bounded engineering work through `openband-ask`;
   - if rollback/redeploy is the recommended containment, state that **explicit human approval is required** before execution.
6. **Verify recovery**
   - repeat the same health/error/latency probes used to establish the incident;
   - confirm the creator-visible or API symptom no longer reproduces;
   - record the verification window and deployment/commit identity.

## Simulated example

The values below are fictional and demonstrate the reporting shape only.

### Observed facts

- Production `POST /api/projects` 5xx rate rose from a 0.3% baseline to 12% between 18:04–18:12 UTC.
- p95 latency rose from 420 ms to 2.8 s in the same window.
- Deployment `abc1234` completed at 18:01 UTC.
- Health probes for unrelated read-only endpoints remained successful.
- No security indicator is present in the supplied evidence.

### Impact / severity

**SEV-2 — Major.** Project creation is a core creator flow and the supplied evidence shows a material failure rate without a demonstrated workaround.

### Hypotheses

1. **Deployment-correlated application regression — medium confidence.** Timing overlaps, but no failing code path has been proven.
2. **Database/dependency saturation — low confidence.** Elevated latency is compatible with it, but no dependency metric was supplied.

### Recommended next action

Inspect traces/logs for failing `POST /api/projects` requests and compare error classes between the healthy baseline and deployment `abc1234`. Build a minimal reproduction before changing production.

If evidence later supports rollback as containment, request explicit human approval; do not execute it from this runbook.

### Authorization boundary

Rollback/redeploy, credential changes, access-control changes and production data repair remain human-authorized actions.

### Verification

After remediation, rerun the same endpoint probe and require both 5xx rate and p95 latency to return to the agreed healthy range for a recorded observation window, then verify project creation from a creator-visible flow.

## Output template

```text
INCIDENT:
ENVIRONMENT:
WINDOW:
AFFECTED SURFACE:
SEVERITY:

OBSERVED FACTS:
- ...

HYPOTHESES:
- ... (confidence: ...; missing proof: ...)

RECOMMENDED NEXT ACTION:
- ...

AUTHORIZATION REQUIRED:
- none | explicit human approval for ...

VERIFICATION:
- ...
```
