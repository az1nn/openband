# Native Build Evidence Contract

## Scope

This contract defines trustworthy CI evidence for OpenBand Android and Electron build verification. It does not define store signing, credential management, release promotion, notarization, Play Store/App Store submission, or production distribution policy.

## Evidence states

Every requested native verification target emits exactly one terminal state:

- `PASS` — required toolchain was available, the build command exited successfully, required output artifacts exist, and artifact validation completed.
- `FAIL` — the supported verification environment was available but dependency installation, compilation, packaging, or artifact validation failed.
- `BLOCKED` — verification could not legitimately run because a declared prerequisite or supported environment capability was unavailable.

`SKIPPED` remains a workflow scheduling state only. It means the target was not requested; it is not evidence that a build passes.

## Trust rules

1. A build command failure MUST NOT be converted to success with `|| echo`, unconditional `true`, ignored exit codes, or equivalent masking.
2. Evidence collection MAY use a non-fatal intermediate step only when a final enforcement step reads the generated evidence and fails the job for `FAIL` or `BLOCKED`.
3. A zero exit code without the expected build artifact is `FAIL`.
4. A target may be `BLOCKED` only for a documented prerequisite condition; product/build errors are `FAIL`, not `BLOCKED`.
5. CI logs and evidence manifests MUST identify the exact source commit SHA and the checkout commit SHA used by the runner.
6. Produced proof artifacts MUST be hashed with SHA-256 and retained alongside the manifest when available.

## Stable reason codes

Terminal evidence uses stable reason codes. Current codes include:

- PASS: `build-and-artifact-validation-passed`.
- FAIL: `build-command-failed`, `expected-artifact-missing`, `artifact-validation-failed`, `evidence-harness-error`.
- BLOCKED: `verification-not-completed`, `build-not-run`, `build-not-executed`, `source-sha-missing`, `npm-unavailable`, `missing-gradle-wrapper`, `gradle-wrapper-not-executable`, `missing-android-build-config`, `java-unavailable`, `java-17-required`, `missing-root-package-lock`, `missing-electron-package`, `missing-electron-package-lock`.

Additional stable reason codes may be introduced only when they preserve the PASS/FAIL/BLOCKED semantics above.

## Android verification target

The CI verification target is an Android packaging/build proof, not a store-ready signed release.

Declared environment baseline:

- Linux GitHub-hosted runner;
- JDK 17;
- Node.js 22.x;
- repository dependency installation completed as part of the build command;
- Gradle wrapper available and executable.

Expected command family: repository dependency installation followed by Gradle wrapper release assembly using the repository-owned Android project.

Expected proof artifact: at least one APK under `android/app/build/outputs/apk/release`. The evidence manifest records exact path, byte size and SHA-256.

Production keystore injection, credential changes and signing-policy redesign are explicitly outside this contract.

## Electron verification target

Declared environment baseline:

- Linux GitHub-hosted runner;
- Node.js 22.x;
- repository and Electron lockfiles available;
- repository dependency installation and Web export/build completed;
- `electron/npm ci` completed before packaging.

Expected command family: repository Web build followed by the repository-owned Electron Linux packaging command.

Expected proof artifacts: both an AppImage and a Debian package under `electron/out`.

The evidence manifest records discovered distributables, byte sizes and SHA-256 hashes.

## Evidence manifest

Each requested target produces a machine-readable manifest containing at minimum:

```json
{
  "schemaVersion": 1,
  "target": "android|electron",
  "state": "PASS|FAIL|BLOCKED",
  "commit": "<source git sha>",
  "checkoutCommit": "<runner checkout git sha>",
  "reason": "<stable reason code>",
  "toolchain": {},
  "artifacts": [
    { "kind": "apk|appimage|deb", "path": "...", "size": 0, "sha256": "..." }
  ],
  "details": {
    "preflight": "PASS|BLOCKED|PENDING",
    "buildOutcome": "success|failure|skipped"
  }
}
```

Human-readable logs may add detail, but the manifest is the durable CI evidence boundary.

## Scheduling

Native verification remains opt-in until repository maintainers explicitly promote it to a mandatory branch gate. The existing `native-build` pull-request label and manual `workflow_dispatch` are valid scheduling mechanisms.

An unrequested target is `SKIPPED`, never `PASS`.

## Security boundary

This contract MUST NOT introduce, rotate, expose, validate, or depend on production signing secrets. Discovery that trustworthy verification requires signing-secret changes escalates the work out of this T3 contract into a separately reviewed security-sensitive change tracked independently from #43.
