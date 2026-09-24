# #73 — Android signing policy and credential hygiene

Issue #73 · Tier T4

## Goal

Replace implicit repository-owned Android release-signing assumptions with an explicit, fail-closed signing boundary that separates unprivileged build verification from privileged production signing.

## Problem

The current Android Gradle configuration mixes release packaging with repository-defined signing fallback behavior and repository-embedded credential assumptions. This creates three material risks:

1. release verification depends on signing material even when the engineering goal is only to prove that the Android application can compile/package;
2. release builds can silently fall back to debug signing semantics rather than preserving a strong production boundary;
3. credential-shaped values and signing policy live in source instead of an external privileged boundary.

The trustworthy native verification work in #43 correctly exposed this condition and stopped rather than weakening its T3 contract.

## Functional requirements

- **FR-001** Repository source, specs, docs and CI configuration MUST NOT contain production signing secret values.
- **FR-002** Unprivileged CI and local verification MUST be able to run the release packaging path without production signing credentials and produce an explicitly non-production, unsigned release APK.
- **FR-003** Production signing MUST require an explicit signing mode and externally supplied keystore path, store password, key alias and key password.
- **FR-004** Missing or partial production signing inputs MUST fail closed before signing; they MUST NOT fall back to debug credentials, a repository default, or unsigned publication.
- **FR-005** The release build type MUST NOT use debug signing as a fallback.
- **FR-006** Pull-request verification MUST NOT require, receive, or expose production signing credentials.
- **FR-007** Logs and machine-readable evidence MAY identify the signing mode and sanitized failure reason, but MUST NOT print credential values or keystore contents.
- **FR-008** Unsigned verification artifacts MUST be distinguishable from production-signed artifacts and MUST NOT be eligible for store publication by implication.
- **FR-009** Repository guidance MUST document credential rotation/recovery if any repository-exposed signing credential assumption was ever used for a real production/upload key.
- **FR-010** No production key generation, store publication, Play Console mutation, or secret provisioning is performed merely to satisfy this feature.
- **FR-011** A security regression test MUST prove that release packaging never falls back to debug signing.
- **FR-012** A security regression test MUST prove that production mode rejects zero, incomplete and malformed signing input without disclosing supplied secret values.
- **FR-013** A positive adversarial test MAY use an ephemeral throwaway signing key generated during CI to prove the production-signing code path without using any real credential.
- **FR-014** Recovery MUST prefer disabling privileged signing/publication and retaining unsigned verification over restoring insecure fallback behavior.
- **FR-015** #43 may only be reconciled after this feature establishes a safe unsigned verification path or another human-approved equivalent that preserves its release-packaging proof.

## Non-goals

- provisioning real GitHub Actions secrets;
- generating or rotating a real production/app-signing key;
- Play Store/App Store publication;
- changing application identity, package name or runtime behavior;
- weakening #43 from release packaging to debug-only verification;
- adding Electron signing/notarization policy.

## Security invariants

- No secret value is committed.
- No production signing material is exposed to ordinary pull-request jobs.
- Production signing is opt-in and fail-closed.
- Verification remains useful when production credentials are absent.
- Debug signing and production signing are different trust domains.
- An unsigned verification artifact is never treated as store-ready.

## Acceptance

The design is acceptable only if a reviewer can answer all of the following from the repository artifacts without relying on an implicit convention:

1. How does CI verify Android release packaging without production credentials?
2. What exact condition enables production signing?
3. Where do production signing inputs come from?
4. What happens when any required input is absent?
5. How is debug fallback prevented?
6. How are secrets prevented from entering logs/commits?
7. How can a suspected credential exposure be contained and recovered from?
8. How does this safely unblock the Android evidence requirement in #43?
