# Feature: Trustworthy Native Build Verification

**Tier:** T3 — native build infrastructure and artifact evidence  
**Issue:** #43

## Goal

Make Android and Electron CI verification produce trustworthy, inspectable build evidence instead of allowing failed native builds to appear successful.

## Problem

The current conditional native jobs run only for `workflow_dispatch` or PRs labeled `native-build`, which is appropriate for the current support level. However, both Android and Electron build commands append `|| echo`, so a real compiler/packager failure can be swallowed and the job can still complete successfully. The workflow also does not preserve a machine-readable terminal evidence state or validate that expected build artifacts actually exist.

## Requirements

- **FR-001 — Explicit evidence states.** Every requested Android/Electron verification MUST produce exactly one durable terminal state: `PASS`, `FAIL`, or `BLOCKED`. Workflow scheduling `SKIPPED` is not build evidence.
- **FR-002 — No failure masking.** Native build command failures MUST NOT be converted into successful jobs with `|| echo`, unconditional `true`, ignored exit codes, or equivalent behavior.
- **FR-003 — Safe evidence collection.** Intermediate build execution MAY be non-fatal only when it always produces evidence and a final enforcement step fails the job for both `FAIL` and `BLOCKED`.
- **FR-004 — Android baseline.** Android verification MUST declare and check its supported CI prerequisites: Linux runner, JDK 17, Node 22.x, root dependency install and executable Gradle wrapper.
- **FR-005 — Electron baseline.** Electron verification MUST declare and check its supported CI prerequisites: Linux runner, Node 22.x, root dependency install, successful Web build and Electron dependency install.
- **FR-006 — Artifact proof.** `PASS` requires expected native output artifacts to exist after the build. A successful command without required output is `FAIL`.
- **FR-007 — Artifact integrity.** Produced evidence MUST record artifact path, byte size and SHA-256 digest.
- **FR-008 — Exact revision.** Every evidence manifest MUST identify the exact commit SHA that was verified.
- **FR-009 — Stable reason codes.** `FAIL` and `BLOCKED` evidence MUST include a stable machine-readable reason code plus human-readable diagnostics in logs.
- **FR-010 — Correct BLOCKED semantics.** `BLOCKED` is reserved for declared prerequisite/environment inability to run. Compiler, bundler, dependency-resolution and packaging defects are `FAIL`.
- **FR-011 — Existing scheduling preserved.** Native build verification MUST remain opt-in through `native-build` PR labeling and/or manual workflow dispatch unless a separately approved change promotes it to a mandatory branch gate.
- **FR-012 — Android output.** Android verification MUST build through the repository-owned Gradle wrapper and validate the configured release-assembly output as a packaging proof artifact.
- **FR-013 — Electron output.** Electron Linux verification MUST use the repository-owned packaging command and validate the configured Linux distributables under `electron/out`.
- **FR-014 — Not store-release evidence.** Android CI packaging proof MUST NOT be represented as proof of production/store signing or release readiness.
- **FR-015 — Signing boundary.** This feature MUST NOT add, rotate, inspect, expose or require production signing secrets. If trustworthy verification requires signing-policy/credential changes, the change MUST be reclassified and separately gated.
- **FR-016 — Runtime architecture unchanged.** No application runtime, React Native bridge, persistence, audio engine, auth/session or backend behavior may change as part of this feature.
- **FR-017 — Deterministic policy tests.** Repository tests MUST fail if the native CI regresses to known failure-masking constructs or if evidence-state classification accepts a build failure as `PASS`.
- **FR-018 — CI artifact retention.** Requested native verification SHOULD upload the evidence manifest and successful build artifacts through GitHub Actions so a human can inspect the proof attached to the exact run.

## Non-goals

- Production Android signing, keystore management or credential rotation.
- macOS notarization, Apple signing or Windows code signing.
- Store submission or release promotion.
- Making native builds mandatory for every PR.
- Runtime bridge/API redesign.
- Fixing unrelated native application defects discovered by the new verification; such defects may be surfaced as `FAIL` and tracked separately.
- Changing the Web release-readiness gate in #51.

## Acceptance

1. Requested Android/Electron jobs can no longer report success after a failed build command.
2. Each requested target leaves durable `PASS`, `FAIL` or `BLOCKED` evidence bound to one commit SHA.
3. `PASS` proves expected output files exist and records size + SHA-256.
4. Missing prerequisites produce `BLOCKED`; actual build/package errors produce `FAIL`.
5. Successful outputs are retained as workflow artifacts together with the evidence manifest.
6. Tests protect the classification rules and prohibit reintroduction of failure-swallowing patterns.
7. Existing application/runtime behavior is unchanged.
8. SDD/Graph, frontend/backend typecheck, Vitest, legacy tests and Web build remain green on the final exact HEAD.

## Risk boundary

This is **T3 minimum** because it changes CI behavior across Android and Electron packaging environments and establishes a durable build-evidence contract.

Escalate to **T4 + fresh Human Design Gate** before any production signing secret, credential, keystore/notarization policy, privileged publication path, destructive packaging behavior, or other security-sensitive release boundary enters scope.
