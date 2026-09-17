# Tasks — Trustworthy Native Build Verification

## Preflight / design

- [x] Revalidate Issue #43 demand.
- [x] Confirm no active #43 implementation branch.
- [x] Trace current conditional Android/Electron CI jobs.
- [x] Confirm failure masking via `|| echo` in both native jobs.
- [x] Trace Android release assembly and Electron Linux packaging outputs.
- [x] Define durable `PASS|FAIL|BLOCKED` evidence contract.
- [x] Preserve opt-in `native-build` label / workflow-dispatch scheduling.
- [x] Exclude signing/keystore/secrets from T3 scope.
- [ ] Run SDD/Graph checks on exact Design Baseline SHA.
- [ ] Freeze exact Design Baseline SHA.
- [ ] HUMAN DESIGN GATE — approve exact baseline before CI/product mutation.

## Implementation

- [ ] Add `scripts/native-build-evidence.mjs` with pure classifier + target adapters.
- [ ] Record exact commit SHA, toolchain context, stable reason code and terminal evidence state.
- [ ] Validate Android prerequisites before executing Gradle.
- [ ] Execute repository-owned Android release assembly without failure masking.
- [ ] Validate Android APK existence and compute size/SHA-256.
- [ ] Validate Electron prerequisites before packaging.
- [ ] Execute repository-owned Electron Linux packaging without failure masking.
- [ ] Validate expected AppImage/deb outputs and compute size/SHA-256.
- [ ] Write `.artifacts/native-build/android.json` and `electron.json`.
- [ ] Add mandatory `enforce` behavior that rejects `FAIL` and `BLOCKED`.
- [ ] Refactor existing CI native jobs to use evidence harness.
- [ ] Keep only evidence-producing build step non-fatal when needed for `always()` artifact upload.
- [ ] Upload evidence manifest with `if: always()`.
- [ ] Upload native artifacts when produced.
- [ ] Preserve conditional native scheduling.
- [ ] Do not alter Android signing credentials/policy or runtime bridge code.

## Regression proof

- [ ] Classifier: missing declared prerequisite → BLOCKED.
- [ ] Classifier: build non-zero → FAIL.
- [ ] Classifier: command success + missing output → FAIL.
- [ ] Classifier: valid output + hash → PASS.
- [ ] Enforce rejects BLOCKED.
- [ ] Enforce rejects FAIL.
- [ ] Workflow policy test rejects native `|| echo` / equivalent masking.
- [ ] Workflow policy test proves `native-build` label/manual scheduling remains.
- [ ] Manifest schema and exact-SHA binding tests PASS.

## Final verification

- [ ] SDD policy PASS.
- [ ] Graph/Spec Kit tests PASS.
- [ ] Engineering Graph CI PASS.
- [ ] Frontend typecheck PASS.
- [ ] Backend typecheck PASS.
- [ ] Focused native evidence tests PASS.
- [ ] Full Vitest PASS.
- [ ] Legacy tests PASS.
- [ ] Web build PASS.
- [ ] Apply `native-build` label to implementation PR.
- [ ] Android job executes and produces trustworthy terminal evidence.
- [ ] Electron job executes and produces trustworthy terminal evidence.
- [ ] Evidence manifests retained and inspected.
- [ ] PASS native outputs retained and inspected.
- [ ] Architecture/code review PASS.
- [ ] Freeze exact implementation HEAD and evidence.
- [ ] HUMAN MERGE GATE — human merges exact verified T3 PR HEAD.
