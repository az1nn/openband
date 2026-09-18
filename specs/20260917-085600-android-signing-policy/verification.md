# Verification — #73 Android signing policy

## Evidence policy

Tier T4 requires security-specific proof in addition to ordinary repository gates. No implementation is considered verified from a green generic CI run alone.

Allowed states follow repository policy:

`PASS | FAIL | BLOCKED | FLAKY | NOT_REQUIRED`

Any required `FAIL`, `BLOCKED` or `FLAKY` result blocks the evidence-driven Merge Gate.

## Design evidence

### Current diagnosis

The current Android release path has one mixed trust boundary:

- release packaging always selects a release signing configuration;
- when the repository-relative production keystore is absent, the release configuration falls back to debug signing material;
- repository source contains credential-shaped production signing assumptions;
- #43's exact-HEAD native verification reached `:app:validateSigningRelease` and failed because the fallback debug keystore was absent.

This establishes that signing policy, not Android compilation, is the blocker.

### Intended trust model

| Path | Privilege | Signing material | Expected artifact | Publication authority |
|---|---|---|---|---|
| PR / verification | unprivileged | none | unsigned release APK | none |
| local debug | developer | debug-only | debug artifact | none |
| production signing | privileged | external complete input set | production-signed release artifact | separate release control plane |

## Required implementation proof

### A. Verification path

- `assembleRelease` with no production signing inputs succeeds.
- Output exists in the release APK path.
- Android signature tooling establishes that the verification artifact is not production signed.
- #43 native evidence harness can hash and retain it without receiving production credentials.

### B. Fail-closed production path

The following must fail before successful signing:

1. unknown signing mode;
2. production mode with no external inputs;
3. production mode with each required input omitted individually;
4. production mode with empty values;
5. production mode with unreadable/nonexistent keystore path;
6. production mode with invalid alias or incompatible throwaway keystore data.

Failures must be deterministic and sanitized.

### C. Positive production-path proof

A CI/test runner may create a throwaway signing identity solely for adversarial verification. The test must prove:

- the complete external interface is sufficient to sign;
- the resulting test artifact has a verifiable signature;
- no generated credential value is committed or retained as a repository artifact;
- the signed test artifact is never presented as a production release.

### D. Secret leakage proof

Use unique runtime canary values for signing inputs. Capture the relevant Gradle/test output and prove none of the canaries appear in:

- stdout/stderr;
- exception text;
- machine-readable build evidence;
- uploaded metadata/artifact names;
- committed/generated documentation.

The test must not print the canaries while asserting their absence.

### E. Downgrade prevention

Prove both statically and behaviorally that:

- `release` does not select `signingConfigs.debug`;
- absence of production inputs leaves verification unsigned rather than debug-signed;
- production mode cannot degrade to verification/debug while returning success.

### F. Least-privilege CI

Review workflow conditions and effective permissions:

- ordinary PR verification does not enable production signing mode;
- no production signing secret is required by PR checks;
- privileged signing, if later automated, is a separate explicit path and outside this feature unless separately approved.

## Recovery verification

Before exact merge-candidate eligibility, verify that the documented recovery path remains viable:

1. production signing can be disabled without disabling unsigned release verification;
2. removing external signing inputs makes production mode fail closed;
3. no rollback instruction restores repository passwords or debug fallback;
4. if historical real-key usage is confirmed or uncertain, rotation/reset remains an explicit human operational task before privileged signing is re-enabled.

## Repository regression matrix

| Gate | Requirement |
|---|---|
| `npm run sdd:check` | PASS |
| `npm run test:graph-sdd` | PASS |
| `npm run graph:ci` | PASS |
| frontend typecheck | PASS |
| backend typecheck | PASS |
| Vitest / focused policy tests | PASS |
| legacy tests | PASS |
| Web build | PASS |
| Android verification release | PASS, unsigned, exact HEAD |
| Electron native build | NOT_REQUIRED for #73; owned by #43. Any inherited failure stays fail-closed and is repaired outside this feature. |
| production input negative matrix | PASS |
| ephemeral signed positive path | PASS |
| canary leakage scan | PASS |
| downgrade prevention review | PASS |
| security specialist/adversarial review | PASS |
| recovery review | PASS |

## Dependency proof for #43

#73 is not complete merely because its own tests pass. The final verified implementation must also demonstrate that the Android target required by #43 can run on the reconciled canonical base without production signing credentials and can emit trustworthy `PASS` evidence for the release-packaging artifact.

This dependency proof does not authorize merging #43 automatically; #43 still requires its own exact-HEAD risk-derived evidence contract and evidence-driven Merge Gate.
