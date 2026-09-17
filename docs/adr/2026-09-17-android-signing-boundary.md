# ADR — Android signing boundary

**Status:** Proposed
**Date:** 2026-09-17
**Issue:** #73

## Context

OpenBand needs two different Android outcomes that were previously coupled:

1. engineering verification must prove that the release variant can compile, bundle and package on an unprivileged runner;
2. production distribution must produce an APK/AAB signed by an authorized release identity.

Treating these as one operation creates avoidable security and reliability problems. Release verification becomes dependent on privileged material, while missing production credentials can tempt a fallback to debug signing or repository defaults. The native verification work in #43 surfaced this coupling when `assembleRelease` reached signing validation and could not continue without the configured fallback keystore.

The repository also contains credential-shaped signing assumptions in Gradle source. No design may assume that such values are safe merely because the keystore itself is absent from Git.

## Decision

OpenBand will separate **release packaging verification** from **production signing**.

### Verification mode

Verification mode is the default for ordinary local/CI build proof.

- The Android `release` variant is compiled and packaged without a production signing configuration.
- The resulting APK is explicitly an unsigned verification artifact.
- No production keystore, password, alias or signing secret is required or loaded.
- Pull-request CI remains unprivileged and cannot silently become a production-signing environment.
- This mode exists to prove build/package integrity, not publishability.

### Production mode

Production signing is opt-in through an explicit Gradle signing-mode property, for example:

`-Popenband.android.signingMode=production`

When production mode is selected, all signing inputs are external to the repository and are resolved from environment variables owned by the privileged release environment:

- `OPENBAND_ANDROID_KEYSTORE_PATH`
- `OPENBAND_ANDROID_KEYSTORE_PASSWORD`
- `OPENBAND_ANDROID_KEY_ALIAS`
- `OPENBAND_ANDROID_KEY_PASSWORD`

The names are part of the interface; values are secrets and MUST NOT appear in source, specs, logs or generated documentation.

Production mode fails before signing when any required input is missing, empty, malformed, unreadable, or inconsistent. It never falls back to:

- debug signing;
- a repository-owned default password/alias;
- a repository-relative production keystore;
- unsigned publication.

### Debug mode

Debug builds retain only normal development/debug semantics. Debug signing material is not a release identity and MUST NOT be used as a fallback for `release`.

### Publication boundary

This ADR does not create a publication workflow or provision secrets. Any future store-publishing workflow must consume a production-signed artifact only from a privileged environment and must not be callable implicitly from ordinary pull-request verification.

## Security properties

The design is intended to provide these guarantees:

1. a fork or pull request can prove Android release packaging without receiving production credentials;
2. absence of production credentials cannot downgrade a production-signing request to debug signing;
3. repository source no longer carries production credential values;
4. production signing has one explicit activation condition and one external credential interface;
5. unsigned verification artifacts are useful evidence but are not publication authority.

## Adversarial verification

Implementation verification must exercise at least:

- ordinary `assembleRelease` without signing secrets produces an unsigned release APK;
- production mode with no inputs fails closed;
- production mode with each single required input missing fails closed;
- supplied secret values do not appear in command output, exception messages, manifests or artifacts;
- release configuration contains no debug fallback;
- ordinary PR workflows do not enable production mode or receive production signing secrets;
- an ephemeral throwaway key may be generated during CI to prove the positive production-signing path, then destroyed with the runner;
- a produced verification APK is demonstrably unsigned, while an ephemeral positive-path artifact is demonstrably signed, when Android tooling exposes that check.

## Recovery and rotation

A suspected credential exposure is handled as a security incident, not by restoring repository defaults.

- Disable privileged signing/publication first while preserving unsigned verification.
- Inventory whether any repository-exposed credential assumption was ever used with a real production or upload key.
- If yes or uncertain, rotate/reset the affected credential or upload key using the platform-supported process and invalidate the old material where possible.
- Re-run adversarial verification before re-enabling privileged signing.
- Do not commit replacement secret values.

If production signing implementation itself regresses, the safe rollback is to disable production signing and continue unsigned verification; falling back to debug signing is not an acceptable recovery strategy.

## Consequences

### Positive

- #43 can verify the release packaging path without privileged credentials.
- Production signing becomes explicit and least-privilege.
- Missing secrets fail closed instead of changing trust domain.
- Credential rotation can occur independently of source history.

### Costs

- A privileged release environment must eventually provision the four external inputs.
- Production publication requires a distinct human/CI control plane.
- Existing release automation, if any, must be reconciled before it can claim store-readiness.

## Rejected alternatives

### Commit or generate a debug keystore so `assembleRelease` passes

Rejected. It makes CI green by preserving the unsafe release→debug fallback and confuses build proof with release identity.

### Put production credentials in Gradle properties or repository `.secrets`

Rejected. Repository-local configuration is not an acceptable secret authority.

### Change #43 to verify only `assembleDebug`

Rejected. That weakens the already-approved native release-packaging proof instead of fixing the actual boundary.

### Give production secrets to all PR builds

Rejected. It violates least privilege and creates an unnecessary exfiltration path.
