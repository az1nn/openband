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

- [x] Can a malicious PR receive a production signing secret under the implemented boundary? **No; ordinary PR jobs receive none.**
- [x] Can missing production inputs silently produce a debug-signed release? **No; verification is unsigned and production fails closed.**
- [x] Can repository compromise alone recover production secret values from the source interface? **No secret values are stored by the boundary.**
- [x] Can release packaging still be verified while privileged signing is disabled? **Yes, via unsigned verification mode.**
- [x] Is historical use of repository-exposed credential assumptions treated as proven-safe? **No; it requires inventory and conditional rotation/reset.**
- [x] Does verification require a real production key? **No; positive-path proof uses an ephemeral throwaway identity.**

## Gate readiness

- [x] `spec.md` covers WHAT.
- [x] `plan.md` + ADR cover HOW.
- [x] `tasks.md` covers WORK.
- [x] `verification.md` covers PROOF.
- [x] `threat-model.md` covers adversarial/security assumptions.
- [x] SDD policy check passes on exact design HEAD.
- [x] Graph/Spec tests pass on exact design HEAD.
- [x] Engineering Graph CI passes on exact design HEAD.
- [x] Exact Design Baseline SHA frozen in PR: `2a50d83e6e0a059948a0d1bc1cf8b7578583ddeb`.
- [x] Human Design Gate approved that exact SHA on 2026-09-17.

## Implementation status

- [x] Default release verification no longer requires signing credentials.
- [x] Production signing is explicit via `openband.android.signingMode=production`.
- [x] Production inputs are external and complete-or-fail.
- [x] Release→debug fallback and repository credential defaults are removed.
- [x] Keystore/password/alias/key are prevalidated before AGP can emit value-bearing signing diagnostics.
- [x] Static regression tests lock the trust boundary and ordinary-CI secret policy.
- [x] Adversarial native verification covers default/explicit unsigned proof, invalid mode, zero/missing/empty inputs, missing keystore, invalid alias, leakage canaries, ephemeral signed positive path and recovery.
- [x] Specialist post-implementation security review is reconciled in `security-review.md`; runtime proof remains mandatory.
- [ ] Exact final HEAD native adversarial job passes.
- [ ] Exact final HEAD ordinary regression suite is reconciled.
- [ ] #43 integration candidate demonstrates release verification without production signing credentials.
- [ ] Exact verified HEAD/evidence is frozen in GitHub.
- [ ] Evidence-driven Merge Gate is SATISFIED for the verified exact merge-candidate HEAD.

## Scope lock

Implementation must not introduce real production secret provisioning, store publication, package/application identity changes, production key generation for reuse, or production credentials into pull-request jobs. Any such requirement invalidates this baseline and requires fresh T4 analysis and approval.
