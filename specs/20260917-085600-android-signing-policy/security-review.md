# Security review — #73 Android signing boundary

## Review scope

This is the pre-implementation T4 specialist review of the proposed repository-side signing boundary. It reviews trust separation, privilege, downgrade behavior, leakage risk, recovery and dependency impact. It does not approve any real production credential, secret store or Play Console configuration.

## Findings

### SR-001 — Current release path mixes trust domains

**Severity:** High

Release packaging currently requires a signing configuration and can fall back to debug signing semantics. That coupling makes an engineering build proof depend on identity material and permits a trust downgrade by configuration.

**Design disposition:** Addressed by ADR separation of unsigned verification from explicit production signing.

### SR-002 — Repository-owned credential assumptions are not an acceptable production authority

**Severity:** High

Credential-shaped defaults in source create disclosure/reuse risk and make rotation dependent on source history.

**Design disposition:** Production inputs become external-only; source keeps names/interface but no secret values. Historical actual use remains an operational inventory question and is not assumed safe.

### SR-003 — PR jobs must not become privileged merely to obtain green CI

**Severity:** Critical boundary condition

Giving production credentials to pull-request verification would create a direct exfiltration path and violate least privilege.

**Design disposition:** Ordinary PR path remains unsigned verification only. Positive signing proof uses a throwaway runtime identity, not production material.

### SR-004 — Unsigned artifacts need explicit trust labeling

**Severity:** Medium

An unsigned release APK is valid engineering evidence but must not be mistaken for a store-ready artifact.

**Design disposition:** ADR and verification matrix separate build integrity from publication authority and require signature-state proof.

### SR-005 — Fail-closed validation must precede signing configuration use

**Severity:** High

Partial or malformed external inputs can otherwise produce ambiguous Gradle failures or unintended fallback behavior.

**Design disposition:** Production mode validates the complete input set and rejects unknown/partial modes before successful signing.

### SR-006 — Logging is a separate attack surface

**Severity:** High

Even when credentials are external, shell tracing, Gradle exceptions or test diagnostics can disclose values.

**Design disposition:** Canary-based leakage verification is mandatory. Tests assert absence without emitting canary values themselves.

### SR-007 — Rotation cannot be automated from repository evidence alone

**Severity:** High when historical real use is confirmed or uncertain

The repository cannot establish whether any historical credential assumption was paired with a real production/upload key.

**Design disposition:** Inventory is human/account-level. If real use occurred or cannot be excluded, privileged signing remains disabled until the affected credential/upload key is rotated or reset through the platform-supported process and verification reruns.

## Abuse cases reviewed

- malicious PR attempts to read signing environment → production inputs absent;
- developer accidentally requests production mode locally with incomplete config → deterministic failure;
- missing prod key causes debug fallback → prohibited by design;
- attacker commits replacement default password → architecture provides no repository secret default to replace;
- unsigned artifact is uploaded as release → repository policy does not grant publication authority to verification artifact;
- logs expose password through error interpolation → canary leakage test must fail the gate;
- positive test accidentally uses persistent key → test requires throwaway runner-scoped identity;
- incident recovery restores old hard-coded fallback for availability → explicitly prohibited.

## Required specialist re-review after implementation

Security review must be repeated against exact implementation HEAD and inspect at minimum:

1. Gradle property/environment resolution and validation order;
2. absence of secret values in the diff;
3. absence of release→debug signing fallback;
4. PR workflow privilege and conditions;
5. negative-input and canary leakage test output;
6. ephemeral-key lifecycle and signature verification;
7. recovery documentation against actual behavior;
8. #43 reconciliation proof.

## Pre-implementation conclusion

The proposed design is internally consistent with the repository's T4 policy and least-privilege constitution. No product/security mutation should begin until the remaining design gates pass and a human approves the exact Design Baseline SHA.
