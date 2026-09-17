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
- [x] Run SDD/Graph checks on exact Design Baseline SHA.
- [x] Freeze exact Design Baseline SHA `20ebab49acfede3f39e63626f937fcc74b04faef`.
- [x] HUMAN DESIGN GATE — approved exact baseline on 2026-09-17.

## Implementation

- [x] Add `scripts/native-build-evidence.mjs` with pure classifier + target adapters.
- [x] Record exact commit SHA, checkout SHA, toolchain context, stable reason code and terminal evidence state.
- [x] Validate Android prerequisites before executing Gradle.
- [x] Execute repository-owned Android release assembly without failure masking.
- [x] Validate Android APK existence and compute size/SHA-256.
- [x] Validate Electron prerequisites before packaging.
- [x] Execute repository-owned Electron Linux packaging without failure masking.
- [x] Validate expected AppImage/deb outputs and compute size/SHA-256.
- [x] Write `.artifacts/native-build/android.json` and `electron.json`.
- [x] Add mandatory `enforce` behavior that rejects `FAIL` and `BLOCKED`.
- [x] Refactor existing CI native jobs to use evidence harness.
- [x] Keep only evidence-producing build/preflight steps non-fatal when needed for final enforcement and `always()` artifact upload.
- [x] Upload evidence manifest with `if: always()`.
- [x] Upload native artifacts when produced.
- [x] Preserve conditional native scheduling.
- [x] Do not alter Android signing credentials/policy or runtime bridge code.

## Regression proof

- [x] Classifier: missing declared prerequisite → BLOCKED.
- [x] Classifier: build non-zero → FAIL.
- [x] Classifier: command success + missing output → FAIL.
- [x] Classifier: valid output + hash-capable artifact contract → PASS.
- [x] Enforce rejects BLOCKED.
- [x] Enforce rejects FAIL.
- [x] Workflow policy test rejects native `|| echo` / equivalent masking.
- [x] Workflow policy test proves `native-build` label/manual scheduling remains.
- [ ] Manifest schema and exact-SHA binding inspected in real CI evidence.

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
- [x] Apply `native-build` label to implementation PR.
- [ ] Android job executes and produces trustworthy terminal evidence.
- [ ] Electron job executes and produces trustworthy terminal evidence.
- [ ] Evidence manifests retained and inspected.
- [ ] PASS native outputs retained and inspected.
- [ ] Architecture/code review PASS.
- [ ] Freeze exact implementation HEAD and evidence.
- [ ] HUMAN MERGE GATE — human merges exact verified T3 PR HEAD.
