# Tasks — Web Release Readiness

## Phase 1 — Preflight and design baseline

- [x] **T001** Confirm #51 as the next #46 delivery slice and create `agent/51-web-release-readiness` from current `master`.
- [x] **T002** Classify as T2 with explicit T3/T4 escalation boundaries.
- [x] **T003** Inspect current Web root, root auth shell, Vercel config, CI launch E2E, README/product positioning, and launch marketing guardrails.
- [x] **T004** Run/record Architecture Graph preflight for `app/index.tsx`, `app/_layout.tsx`, and reused first-run surfaces; confirm no tier escalation.
- [x] **T005** Produce `openband.json`, `spec.md`, `plan.md`, `tasks.md`, `checklist.md`, and `verification.md`.
- [x] **T006** Run Spec Kit analysis; all 16 requirements have task coverage and no material contradiction or Constitution conflict remains.
- [x] **T007** Freeze Design Baseline SHA `e2ea8f8fd2ea192afcc395e30bb1bd53d81b2640` and record Human Design Gate approval in PR #69.

## Phase 2 — Public Web entry

- [x] **T101** Add a Web-only `/` landing and narrowly exempt only Web `/` from the unauthenticated root-shell redirect while preserving protected routes and non-Web root behavior.
- [x] **T102** Implement repository-owned launch promise, Web alpha status, proof row, creation CTA, and source CTA.
- [x] **T103** Route Start creating into the existing `/login` → visitor → first-run path without a parallel auth/project path.
- [x] **T104** Make View source open the canonical public repository.
- [x] **T105** Verify current Web title/description/social metadata; no new metadata/deployment architecture required.

## Phase 3 — Release documentation and claim convergence

- [x] **T201** Add `docs/release/web-alpha.md` with URL/revision evidence fields, browser matrix, mic/storage limitations, data boundaries, smoke, and rollback procedure.
- [x] **T202** Reconcile README opening/status/capability claims and link the release runbook.
- [x] **T203** Review `docs/product.md`; no change required because its Web MVP/local-first/hosted boundaries already match the release contract.
- [x] **T204** Review launch-facing marketing copy for contradictions; existing strategy/guardrails remain aligned.
- [x] **T205** Avoid universal offline/privacy, mature-DAW parity, unlimited capacity, unsupported-browser, pricing, or competitor overclaims.

## Phase 4 — Focused automated proof

- [x] **T301** Add focused tests for public Web root, protected-route retention, and non-Web root fallback.
- [x] **T302** Test primary CTA integration and source CTA target.
- [x] **T303** Test visible alpha status and core launch claims.
- [x] **T304** Adapt `web-launch-e2e` to include landing → Start creating while preserving persistence/export assertions.
- [ ] **T305** Obtain a clean full CI on the exact final implementation/evidence HEAD.

## Phase 5 — Convergence and release evidence

- [x] **T401** Run convergence review; the TypeScript root-detection defect was fixed rather than masked and no requirement was weakened.
- [x] **T402** Run post-implementation Architecture Graph evidence (`35006469726`) and compare with preflight; no tier escalation required; temporary workflow removed.
- [ ] **T403** Record exact final candidate HEAD and CI run with every required job green.
- [ ] **T404** Deploy/promote the exact candidate revision through the existing Web/Vercel path.
- [ ] **T405** Record canonical deployed URL and verify revision identity as exposed by the deployment mechanism.
- [ ] **T406** Run deterministic production smoke for landing → visitor → creation/import → persistence/reopen → WAV export.
- [ ] **T407** Run human real-microphone smoke on at least one browser intended to be labeled supported.
- [ ] **T408** Complete browser support matrix from actual release evidence; leave unproven combinations experimental/unverified.
- [ ] **T409** Name a concrete previous known-good revision/deployment and review rollback + post-rollback smoke.
- [ ] **T410** Reconcile README/product/release docs against the exact deployed candidate after evidence is known.

## Phase 6 — Merge gate and cleanup

- [ ] **T501** Confirm no required evidence is FAIL/BLOCKED/FLAKY and no review thread/review is blocking.
- [ ] **T502** Confirm PR is current with `master`, mergeable, and contains no temporary workflows/evidence scaffolding.
- [ ] **T503** Present Human Merge Gate against the exact verified PR HEAD and deployed candidate evidence.
- [ ] **T504** Human merges the PR; agent does not merge T2+.
- [ ] **T505** After merge, verify public release remains healthy and reconcile #51/#46 tracking state.
