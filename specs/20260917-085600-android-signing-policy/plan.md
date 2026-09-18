# Plan — #73 Android signing policy

**Tier:** T4
**ADR:** docs/adr/2026-09-17-android-signing-boundary.md

## Diagnosis

`android/app/build.gradle` currently couples release packaging to signing configuration. When the repository-owned production keystore path is absent, release signing falls back to a debug keystore path. The same block also contains credential-shaped release defaults in source. #43 proved this coupling by reaching `:app:validateSigningRelease` and failing because the fallback debug keystore was absent.

This is not a native compilation defect. It is a trust-boundary defect: build verification and production signing have different privilege requirements but share one path.

## Design

### 1. Explicit signing modes

The Gradle boundary will recognize two release modes:

- `verification` — ordinary/unprivileged mode; release variant is packaged unsigned and no production credential is resolved;
- `production` — privileged mode, activated explicitly through `-Popenband.android.signingMode=production` and requiring all external signing inputs.

Any other signing-mode value fails closed.

### 2. External production credential interface

Production mode resolves only the named external inputs defined by the ADR. No secret value is stored in Gradle source, checked-in properties, Spec Kit artifacts, docs, CI YAML or test fixtures.

A small policy helper may centralize mode/input validation so behavior can be unit-tested without embedding secret values.

### 3. No release→debug downgrade

`release` receives a signing config only when production mode is explicitly enabled and validated. Verification mode leaves release unsigned. Debug signing remains isolated to debug builds.

### 4. CI boundary

Ordinary pull-request jobs remain verification-only. #73 does not add production credentials to PR jobs and does not create a store publication action.

A T4 test workflow or test step may generate an ephemeral throwaway key at runtime to prove the positive signing path. It must:

- use runner-temporary storage;
- use runtime-generated non-reused credential material;
- mask any generated sensitive values before invoking Gradle;
- destroy with the ephemeral runner;
- never publish that artifact as a production release.

### 5. #43 reconciliation

After #73 is merged, #43 can reconcile with canonical `master` and rerun `assembleRelease` in verification mode. The expected proof remains a release APK; it is simply no longer coupled to production signing authority.

## Expected touched surfaces

- `android/app/build.gradle`
- focused signing-policy helper/tests under `scripts/` and/or `tests/`
- CI only if required to run adversarial verification without privileged production secrets
- `docs/adr/2026-09-17-android-signing-boundary.md`
- security/release documentation only where needed to prevent duplicate policy

No application runtime, bridge, persistence or audio behavior should change.

## Architecture assessment

The change is build/security infrastructure, not runtime architecture. It changes the privileged release boundary and therefore remains T4 regardless of Graph centrality.

Before implementation, run Architecture Graph impact for the actual touched repository paths where supported. Graph may elevate the plan but cannot lower T4.

## Adversarial verification

Required scenarios:

1. no signing mode + no secrets → unsigned release verification PASS;
2. explicit `verification` + no secrets → unsigned release verification PASS;
3. invalid signing mode → FAIL before build/signing;
4. production mode + no inputs → FAIL closed;
5. production mode + each individual required input omitted → FAIL closed;
6. production mode + unreadable/missing keystore path → FAIL closed;
7. production mode + ephemeral throwaway complete inputs → signed APK PASS;
8. secret canary values are absent from captured logs/errors/manifests;
9. release config has no debug-signing fallback;
10. ordinary PR CI does not opt into production signing;
11. unsigned verification artifact cannot be mistaken for signed production evidence.

## Recovery plan

If implementation causes signing instability:

- disable production signing mode or privileged release invocation;
- preserve unsigned verification capability;
- use the last known good production-signed artifact for operational recovery if distribution is required;
- do not restore repository-embedded credentials or debug fallback;
- if exposure is suspected, rotate/reset the affected upload/signing credential before re-enabling privileged signing.

## Verification matrix

| Area | Evidence |
|---|---|
| SDD policy | `npm run sdd:check` |
| Spec/Graph | `npm run test:graph-sdd`, `npm run graph:ci` |
| Frontend/backend regression | existing typechecks/tests remain green |
| Android verification | unsigned `assembleRelease` succeeds without production inputs |
| Production fail-closed | zero/partial/malformed input matrix |
| Positive signing path | ephemeral throwaway key + signature verification |
| Secret leakage | canary log scan / sanitized error assertions |
| Downgrade prevention | static/behavioral proof release never uses debug fallback |
| CI privilege | workflow review proving PR jobs do not enable production mode |
| Recovery | documented disable/rotate/reverify procedure |

## Post-#82 evidence reconciliation

Canonical `master` now uses schemaVersion 2 evidence contracts and an evidence-driven exact-HEAD Merge Gate. #73 therefore declares the common mandatory checks plus the feature-specific `android-signing-boundary` and `android-build` jobs in `openband.json`.

The shared `native-build` scheduling surface can also execute Electron verification. Electron remains owned by #43 and is **NOT_REQUIRED** evidence for #73. If that shared scheduling exposes an inherited Electron baseline defect, #73 must not mask or tolerate the failure: isolate/fix the baseline defect in its own workstream, then rerun #73 on the corrected canonical base. The currently observed lockfile reproducibility defect is tracked as #104.

This governance reconciliation does not change the signing trust model, but it changes the material verification contract. The previously approved Design Baseline is therefore stale and a fresh Human Design Gate is required before further implementation mutation.

## Gate invalidation

Human Design Gate approval is invalidated if implementation requires any of the following:

- real production secret provisioning or mutation;
- changing package/application identity;
- store publication automation;
- granting production secrets to pull-request workflows;
- a different signing-mode trust model;
- weakening release verification to debug-only packaging;
- altering #43 evidence semantics beyond the approved unsigned-release reconciliation.
