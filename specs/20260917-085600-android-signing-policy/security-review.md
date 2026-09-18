# Security review — #73 Android signing boundary

## Review scope

This T4 specialist review covers the repository-side Android signing boundary: trust separation, privilege, downgrade behavior, leakage risk, recovery and dependency impact. It does not approve any real production credential, secret store or Play Console configuration.

## Findings

### SR-001 — Current release path mixed trust domains

**Severity:** High

The pre-change release path coupled packaging to signing configuration and could fall back to debug signing semantics. That made engineering build proof depend on identity material and allowed configuration-level trust downgrade.

**Disposition:** Addressed by separating unsigned verification from explicit production signing.

### SR-002 — Repository-owned credential assumptions are not an acceptable production authority

**Severity:** High

Credential-shaped defaults in source create disclosure/reuse risk and make rotation dependent on source history.

**Disposition:** Addressed in implementation. Production source now carries only interface names; prior repository-relative keystore/password/alias defaults were removed. Historical real-world use remains an operational inventory question and is not assumed safe.

### SR-003 — PR jobs must not become privileged merely to obtain green CI

**Severity:** Critical boundary condition

Giving production credentials to pull-request verification would create a direct exfiltration path and violate least privilege.

**Disposition:** Addressed. Ordinary PR/native verification receives no production signing inputs. Positive-path proof creates a throwaway runtime identity on the ephemeral runner.

### SR-004 — Unsigned artifacts need explicit trust labeling

**Severity:** Medium

An unsigned release APK is valid engineering evidence but must not be mistaken for a store-ready artifact.

**Disposition:** Addressed by ADR/spec semantics and behavioral signature-state checks: verification output must fail `apksigner verify`; ephemeral production-path output must pass it.

### SR-005 — Fail-closed validation must precede signing configuration use

**Severity:** High

Partial or malformed external inputs can otherwise produce ambiguous Gradle/AGP failures or unintended fallback behavior.

**Disposition:** Addressed. Mode and complete input presence are validated first. Keystore readability, store password, alias/key-entry presence and key password are then prevalidated through Java `KeyStore` before values are handed to the Android Gradle Plugin. Incompatibilities collapse to a value-free error.

### SR-006 — Logging is a separate attack surface

**Severity:** High

Even when credentials are external, shell tracing, Gradle exceptions or upstream signing diagnostics can disclose values.

**Disposition:** Addressed in code and adversarial test design. Errors contain only stable policy text or missing input names. Runtime canaries cover passwords, alias and path; the positive path masks ephemeral values in GitHub Actions and scans captured Gradle output for leakage.

### SR-007 — Rotation cannot be automated from repository evidence alone

**Severity:** High when historical real use is confirmed or uncertain

The repository cannot establish whether any historical credential assumption was paired with a real production/upload key.

**Disposition:** Remains an explicit human/account-level recovery condition. If real use occurred or cannot be excluded, privileged signing stays disabled until the affected credential/upload key is rotated or reset through the platform-supported process and verification reruns.

## Post-implementation exact-diff review

The implementation diff was reviewed after the Human Design Gate and before final runtime verification.

Observed properties:

1. `release` has no `signingConfigs.debug` reference and receives `signingConfigs.production` only when `openband.android.signingMode=production`.
2. Default mode is `verification`; unsupported modes fail before Android signing configuration succeeds.
3. Production inputs are only `OPENBAND_ANDROID_KEYSTORE_PATH`, `OPENBAND_ANDROID_KEYSTORE_PASSWORD`, `OPENBAND_ANDROID_KEY_ALIAS` and `OPENBAND_ANDROID_KEY_PASSWORD`.
4. No real secret value, persistent keystore, repository password, repository alias default, store publication step or package/application identity change was introduced.
5. CI does not map production inputs from GitHub secrets and does not invoke production mode for ordinary PR verification.
6. The T4 positive path uses only a runner-temporary PKCS12 identity generated at runtime and removed with the temporary directory/runner.
7. The adversarial matrix covers default and explicit unsigned verification, invalid mode, zero inputs, each missing input, each empty input, missing keystore, invalid alias, signed ephemeral positive path, leakage checks and recovery to unsigned verification.
8. Electron/native hardening outside Android signing remains owned by #43; it is not silently folded into this security boundary.

## Abuse cases reviewed

- malicious PR attempts to read signing environment → production inputs absent;
- developer accidentally requests production mode locally with incomplete config → deterministic failure;
- missing prod key causes debug fallback → prohibited structurally and behaviorally;
- malformed store/alias/key reaches upstream diagnostics → prevalidated and collapsed to value-free failure;
- attacker commits replacement default password → architecture provides no repository secret default to replace;
- unsigned artifact is treated as production → signature-state evidence and policy deny publication authority;
- logs expose password/path/alias → runtime canary leakage test fails the gate;
- positive test accidentally uses persistent key → test generates a runner-scoped one-run identity;
- incident recovery restores old hard-coded fallback for availability → explicitly prohibited.

## Runtime proof still required for final convergence

The post-implementation code review is **PASS**, subject to exact-HEAD runtime evidence. Evidence-driven Merge Gate remains blocked until the final candidate demonstrates:

- unsigned verification APK production and signature-state proof;
- complete negative input matrix with sanitized output;
- ephemeral production signing and signature verification;
- recovery back to unsigned verification;
- SDD/Graph/typecheck/Vitest/legacy/Web regression gates on the affected final HEAD;
- classification of inherited #43/#69 failures without weakening #73 requirements.

## Conclusion

The implemented trust boundary remains inside the originally approved T4 trust model and materially improves least privilege and failure isolation. No security-review finding requires a different trust model. Independently, the post-#82/#102 evidence-governance reconciliation materially changes the verification contract, so the historical manual Design Gate is non-authoritative; the reconciled feature must pass current automated design validation before further implementation mutation. Runtime evidence, not this review alone, decides exact-HEAD merge eligibility.
