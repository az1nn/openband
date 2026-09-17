# Verification — Trustworthy Native Build Verification

## Evidence model

Required target states:

```text
PASS | FAIL | BLOCKED
```

Workflow scheduling may also be `SKIPPED`, but `SKIPPED` is not build evidence.

A required `FAIL` or `BLOCKED` state blocks the Human Merge Gate. A requested target must never be inferred PASS from a successful surrounding workflow when its own build did not complete.

## Preflight snapshot

- Canonical issue: #43 — Harden native Android/Electron build verification.
- Tier: T3 minimum.
- Design branch: `agent/43-native-build-verification`.
- Branch creation base: `2aa887e3bd2ab4643407ae96532966ec1fed9767`.
- No pre-existing #43 branch was found.

## Current defect evidence

Current `.github/workflows/ci.yml` behavior:

```text
Android: ./gradlew assembleRelease || echo ...
Electron: npm run build:linux || echo ...
```

Both constructs can convert a real native-build failure into a successful job. The current workflow also does not require expected output files or retain a native evidence manifest.

## Planned deterministic proof

### Classifier

Use pure fixtures/stubs for toolchain/build/artifact outcomes:

| Scenario | Expected |
|---|---|
| declared prerequisite unavailable | BLOCKED |
| supported environment + build exits non-zero | FAIL |
| build exits zero + expected output absent | FAIL |
| output exists + digest/metadata succeeds | PASS |
| artifact hashing/validation fails | FAIL |

### Enforcement

`enforce` must exit successfully only for `PASS`. `FAIL`, `BLOCKED`, malformed evidence and missing evidence all produce a failing enforcement step.

### Workflow policy

Static workflow tests must prove:

- native build command paths no longer use `|| echo` or equivalent unconditional success masking;
- the evidence-producing build step cannot be the terminal authority;
- a final enforcement step runs with `if: always()`;
- evidence upload runs with `if: always()`;
- Android/Electron jobs remain conditional on manual dispatch and/or `native-build` label.

### Real CI proof

Before Human Merge Gate, run the implementation PR with `native-build` requested.

For each target capture:

- exact HEAD SHA;
- job URL/id;
- manifest terminal state;
- manifest reason code;
- toolchain metadata;
- retained evidence artifact;
- native output artifact path, size and SHA-256 when PASS.

## Security boundary proof

Review final diff and confirm no change to production signing credentials, keystore/notarization secrets, publication credentials or privileged release paths. Any such diff invalidates the T3 gate and requires T4 reclassification.

## Required final verification matrix

| Evidence | Required state |
|---|---|
| SDD policy | PASS |
| Graph/Spec Kit tests | PASS |
| Engineering Graph CI | PASS |
| Frontend typecheck | PASS |
| Backend typecheck | PASS |
| Focused native-evidence tests | PASS |
| Full Vitest | PASS |
| Legacy tests | PASS |
| Web build | PASS |
| Android requested native verification | PASS |
| Electron requested native verification | PASS |
| Native evidence manifests retained | PASS |
| Native PASS artifacts retained | PASS |
| Security-boundary diff review | PASS |
| Required review threads | resolved / no blocker |

## Gate freshness

Human Design Gate binds to one exact design SHA. Any normative design change after approval requires re-evaluation.

Human Merge Gate binds to one exact implementation HEAD. Changes to workflow, evidence harness, native build configuration or normative verification documents after final evidence require affected checks to be rerun.
