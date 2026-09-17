# Plan — Trustworthy Native Build Verification

## Classification

**Tier:** T3  
**Issue:** #43  
**Durable contract:** `docs/contracts/native-build-evidence.md`  
**ADR:** NOT REQUIRED — runtime architecture and bridge boundaries are unchanged; this feature hardens CI/evidence semantics inside the existing build topology.

## Current-state diagnosis

- `.github/workflows/ci.yml` keeps Android/Electron jobs conditional on manual dispatch or the `native-build` PR label.
- Android uses JDK 17 + Node 22 and invokes `./gradlew assembleRelease`, but appends `|| echo`, so a failed Gradle build can be reported as job success.
- Electron builds Web first, installs `electron/` dependencies, invokes `npm run build:linux`, and also appends `|| echo`.
- Neither target emits a machine-readable `PASS|FAIL|BLOCKED` evidence manifest.
- Neither target requires expected native output artifacts to exist before reporting success.
- No workflow artifact upload currently preserves APK/AppImage/deb proof.
- Android project signing behavior already exists in Gradle; changing production signing credentials/policy is intentionally outside this feature.

## Design

### 1. Add a native-build evidence harness

Add a small Node.js harness under `scripts/` with pure/testable classification helpers and target adapters.

Suggested interface:

```text
node scripts/native-build-evidence.mjs run android
node scripts/native-build-evidence.mjs run electron
node scripts/native-build-evidence.mjs enforce android
node scripts/native-build-evidence.mjs enforce electron
```

`run`:

1. records exact commit SHA and toolchain context;
2. validates target prerequisites;
3. executes the repository-owned build command;
4. validates expected output files;
5. hashes discovered artifacts;
6. writes `.artifacts/native-build/<target>.json` with `PASS|FAIL|BLOCKED`;
7. exits non-zero for non-PASS after evidence is safely written.

To preserve upload/diagnostic steps, CI may mark only the `run` step `continue-on-error: true`. This is not masking because a mandatory later `enforce` step re-reads the manifest and exits non-zero for every non-PASS state.

### 2. Stable classification rules

Pure classifier functions distinguish:

- missing/unsupported declared prerequisite → `BLOCKED`;
- dependency/build/compiler/packager non-zero exit → `FAIL`;
- zero exit with missing expected output → `FAIL`;
- expected output present and validated → `PASS`.

Stable reason-code examples:

```text
BLOCKED_JAVA_UNAVAILABLE
BLOCKED_GRADLE_WRAPPER_UNAVAILABLE
BLOCKED_UNSUPPORTED_RUNNER
FAIL_BUILD_COMMAND
FAIL_ARTIFACT_MISSING
FAIL_ARTIFACT_HASH
PASS
```

Do not classify ordinary product/build failures as `BLOCKED`.

### 3. Android adapter

Supported CI baseline:

- Linux GitHub-hosted runner;
- JDK 17;
- Node 22.x;
- root `npm ci` completed;
- executable `android/gradlew`.

Build through the existing Gradle wrapper and release assembly target. Validate one or more APK files in the Gradle release-output directory.

The manifest explicitly identifies this as a **CI packaging verification artifact**, not store-signing evidence.

No signing-secret or keystore-policy change is authorized.

### 4. Electron Linux adapter

Supported CI baseline:

- Linux GitHub-hosted runner;
- Node 22.x;
- root `npm ci` completed;
- Web build completed;
- `electron/npm ci` completed.

Run the existing `npm run build:linux`. Validate configured Linux outputs under `electron/out`, requiring the expected AppImage and `.deb` distributables unless implementation evidence shows electron-builder emits an equivalent deterministic filename/extension pattern that must be encoded explicitly.

### 5. CI integration

Refactor the two existing conditional jobs rather than adding parallel competing native pipelines.

For each target:

1. setup declared toolchain;
2. install dependencies/build Web as required;
3. run evidence harness with `continue-on-error: true` only for the evidence-producing build step;
4. upload `.artifacts/native-build/<target>.json` with `if: always()`;
5. upload successful native outputs when present;
6. execute mandatory `enforce` step with `if: always()`;
7. final job is successful only for manifest `PASS`.

Keep existing label/manual opt-in behavior.

### 6. Policy regression tests

Add focused Node/Vitest tests for:

- classifier state mapping;
- missing artifact after zero build → FAIL;
- prerequisite absence → BLOCKED;
- build non-zero → FAIL;
- successful artifact metadata/hash → PASS;
- `enforce` rejects FAIL/BLOCKED;
- CI YAML no longer contains failure-swallowing native build commands;
- conditional scheduling remains present.

Avoid testing GitHub-hosted runner internals through brittle snapshots.

### 7. Artifact/evidence review

On the implementation PR, request `native-build` so both jobs actually execute. Human Merge Gate requires real CI evidence from both targets on the exact implementation HEAD:

- Android requested and terminal;
- Electron requested and terminal;
- manifests retained;
- successful artifacts retained for PASS targets;
- no target represented as PASS when skipped/blocked/failed.

A genuine native product defect surfaced by the hardened job is not to be bypassed. Fix it within approved scope if local and architecture-neutral; otherwise log a new issue and keep #43 BLOCKED/FAIL until resolved.

## Expected touched surfaces

Primary:

- `.github/workflows/ci.yml`
- `scripts/native-build-evidence.mjs`
- focused tests under `tests/`
- `package.json` only if a stable convenience command improves reproducibility

Expected unchanged:

- application runtime code;
- bridge interfaces;
- Android signing configuration;
- Electron main/preload runtime behavior;
- backend/auth/persistence/audio code.

## Security boundary

Current Android Gradle configuration includes existing signing behavior. This plan does not modify, copy into CI, validate, rotate, or depend on production signing credentials. Any implementation need to do so invalidates this T3 Design Gate and requires a separately reviewed T4/security-sensitive plan.

## Verification strategy

Required before Human Merge Gate on one exact implementation HEAD:

- SDD policy PASS;
- Graph/Spec Kit tests PASS;
- Engineering Graph CI PASS;
- frontend typecheck PASS;
- backend typecheck PASS;
- focused native-evidence tests PASS;
- full Vitest PASS;
- legacy tests PASS;
- Web build PASS;
- Android native job requested and trustworthy terminal evidence produced;
- Electron native job requested and trustworthy terminal evidence produced;
- evidence manifests uploaded/inspectable;
- native build outputs uploaded for PASS targets;
- no required evidence in FAIL/BLOCKED/FLAKY state;
- review threads resolved and PR mergeable.
