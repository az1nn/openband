# Checklist — #73 Android signing policy

## Design completeness

- [x] Issue identity and T4 classification are explicit.
- [x] Security-sensitive risk triggers are recorded.
- [x] Current release-signing coupling is diagnosed from repository code and #43 CI evidence.
- [x] ADR defines verification, debug and production trust domains.
- [x] Production signing activation is explicit and fail-closed.
- [x] Production credential values are excluded from repository artifacts by design.
- [x] Pull-request verification remains unprivileged.
- [x] Release→debug fallback is explicitly prohibited.
- [x] Unsigned verification artifacts are distinguished from production-signed artifacts.
- [x] Adversarial verification includes zero/partial/invalid inputs, positive throwaway signing and leakage checks.
- [x] Recovery/rotation behavior is defined without restoring insecure fallback.
- [x] #43 dependency/unblocking condition is explicit.
- [x] Scope exclusions cover real secret provisioning, key rotation, store publication and package identity changes.

## T4 review questions

- [x] Can a malicious PR receive a production signing secret under the proposed design? **No.**
- [x] Can missing production inputs silently produce a debug-signed release? **No.**
- [x] Can repository compromise alone recover production secret values from the proposed source interface? **No.**
- [x] Can release packaging still be verified while privileged signing is disabled? **Yes, via unsigned verification mode.**
- [x] Is historical use of repository-exposed credential assumptions treated as proven-safe? **No; it requires inventory and conditional rotation/reset.**
- [x] Does the design require a real production key to prove the implementation? **No; positive-path proof uses an ephemeral throwaway identity.**

## Gate readiness

- [x] `spec.md` covers WHAT.
- [x] `plan.md` + ADR cover HOW.
- [x] `tasks.md` covers WORK.
- [x] `verification.md` covers PROOF.
- [x] `threat-model.md` covers adversarial/security assumptions.
- [ ] SDD policy check passes on exact design HEAD.
- [ ] Graph/Spec tests pass on exact design HEAD.
- [ ] Engineering Graph CI passes on exact design HEAD.
- [ ] Exact Design Baseline SHA frozen in PR.
- [ ] Human Design Gate approves that exact SHA.

## Implementation lock

Until the Human Design Gate is approved, do not modify:

- `android/app/build.gradle` signing behavior;
- CI secret exposure/provisioning;
- keystore files or signing credentials;
- store publication paths;
- application/package identity.
