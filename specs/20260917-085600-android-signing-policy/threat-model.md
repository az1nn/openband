# Threat model — #73 Android signing boundary

## Assets

- Android production/upload signing identity.
- Signing credential confidentiality.
- Integrity of store-ready artifacts.
- Integrity of CI evidence used by #43 and future release automation.
- Ability to distinguish verification artifacts from production-signed artifacts.

## Trust domains

1. **Ordinary PR / verification CI** — unprivileged; may build/package but must not receive production signing authority.
2. **Developer debug environment** — local development identity only; never production authority.
3. **Privileged release environment** — may receive externally provisioned production signing material and explicitly request production mode.
4. **Repository** — source/policy only; never a secret store.

## Adversaries and failure modes

### A. Pull-request secret exfiltration

A malicious or compromised PR modifies build logic to print/read production credentials.

**Control:** PR jobs do not receive production signing credentials. Production mode is not activated in ordinary PR verification.

### B. Silent trust downgrade

Production signing inputs are missing, so Gradle falls back to debug signing or another repository default.

**Control:** production mode validates a complete external input set and fails closed. Release never falls back to debug signing.

### C. Repository credential disclosure

Credential-shaped values are committed, copied into docs/specs, or exposed through generated artifacts.

**Control:** source contains only interface names; no secret values. Security review includes repository scans and canary leakage tests.

### D. Artifact confusion

An unsigned verification APK is mistaken for a production-signed distributable.

**Control:** verification mode is explicitly non-production; tests verify signature state; publication policy requires privileged production mode.

### E. Partial configuration

Some signing inputs are present while others are stale, empty, malformed, or point to an unreadable keystore.

**Control:** validate the complete input set before constructing the production signing configuration. Any inconsistency fails before signing.

### F. Log leakage

Gradle exception handling, shell tracing or evidence generation prints secret values.

**Control:** never echo credential values; sanitize errors; run canary secret values during adversarial tests and assert they are absent from captured output.

### G. Reuse of previously exposed assumptions

A credential value that appeared in repository history is reused with a real production/upload key.

**Control:** treat actual use as unknown until inventoried. If real use occurred or cannot be excluded, disable privileged signing and rotate/reset the affected credential or upload key before re-enabling production signing.

### H. Compromised privileged release environment

An authorized release runner is compromised and production signing material is stolen.

**Control:** least-privilege release environment, ephemeral materialization, minimal exposure duration, no PR access, rotation/recovery procedure. Full release infrastructure hardening beyond this boundary requires its own review if architecture changes materially.

## Security assertions

- Repository compromise alone does not reveal a production signing secret value.
- PR execution alone does not grant production signing authority.
- Missing credentials cannot produce a differently trusted artifact while returning success.
- Debug credentials cannot authorize release signing.
- Verification remains available during production-signing disablement or credential rotation.

## Residual risk

This feature cannot prove whether a historical credential assumption was ever paired with a real production key. That requires human/account inventory. Until established, the repository must not claim that historical credentials are uncompromised.

This feature also does not secure external secret stores or Play Console accounts; it defines the repository-side contract those systems must satisfy.
