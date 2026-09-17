# Native Build Evidence Contract

## Scope

This contract defines trustworthy CI evidence for OpenBand Android and Electron build verification. It does not define store signing, credential management, release promotion, notarization, Play Store/App Store submission, or production distribution policy.

## Evidence states

Every native verification target emits exactly one terminal state:

- `PASS` — required toolchain was available, the build command exited successfully, required output artifacts exist, and artifact validation completed.
- `FAIL` — the supported verification environment was available but compilation, packaging, or artifact validation failed.
- `BLOCKED` — verification could not legitimately run because a declared prerequisite or supported environment capability was unavailable.

`SKIPPED` remains a workflow scheduling state only. It means the target was not requested; it is not evidence that a build passes.

## Trust rules

1. A build command failure MUST NOT be converted to success with `|| echo`, unconditional `true`, ignored exit codes, or equivalent masking.
2. Evidence collection MAY use a non-fatal intermediate step only when a final enforcement step reads the generated evidence and fails the job for `FAIL` or `BLOCKED`.
3. A zero exit code without the expected build artifact is `FAIL`.
4. A target may be `BLOCKED` only for a documented prerequisite condition; product/build errors are `FAIL`, not `BLOCKED`.
5. CI logs and evidence manifests MUST identify the exact repository commit SHA and target.

## Android verification target

The CI verification target is an Android packaging/build proof, not a store-ready signed release.

Declared environment baseline:

- Linux GitHub-hosted runner;
- JDK 17;
- Node.js 22.x;
- repository `npm ci` completed;
- Gradle wrapper available and executable.

Expected command family: Gradle wrapper release assembly using the repository-owned Android project.

Expected proof artifact: APK under the Gradle release output directory. The evidence manifest records exact path, byte size and SHA-256 when present.

Production keystore injection, credential changes and signing-policy redesign are explicitly outside this contract.

## Electron verification target

Declared environment baseline:

- Linux GitHub-hosted runner;
- Node.js 22.x;
- repository `npm ci` completed;
- Web export/build completed;
- `electron/npm ci` completed.

Expected command family: repository-owned Electron Linux packaging command.

Expected proof artifacts: Linux distributables emitted under `electron/out`, including the configured AppImage and Debian package when the builder reports success.

The evidence manifest records discovered distributables, byte sizes and SHA-256 hashes.

## Evidence manifest

Each requested target produces a machine-readable manifest containing at minimum:

```json
{
  "schemaVersion": 1,
  "target": "android|electron",
  "state": "PASS|FAIL|BLOCKED",
  "commit": "<git sha>",
  "reason": "<stable reason code>",
  "toolchain": {},
  "artifacts": [
    { "path": "...", "size": 0, "sha256": "..." }
  ]
}
```

Human-readable logs may add detail, but the manifest is the durable CI evidence boundary.

## Scheduling

Native verification remains opt-in until repository maintainers explicitly promote it to a mandatory branch gate. The existing `native-build` pull-request label and manual `workflow_dispatch` are valid scheduling mechanisms.

An unrequested target is `SKIPPED`, never `PASS`.

## Security boundary

This contract MUST NOT introduce, rotate, expose, validate, or depend on production signing secrets. Discovery that trustworthy verification requires signing-secret changes escalates the work out of this T3 contract into a separately reviewed security-sensitive change.
