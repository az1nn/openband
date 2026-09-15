# Tasks — Web Release Readiness

## Phase 1 — Preflight and design baseline

- [x] **T001** Confirm #51 as the next #46 delivery slice and create `agent/51-web-release-readiness` from current `master`.
- [x] **T002** Classify as T2 with explicit T3/T4 escalation boundaries.
- [x] **T003** Inspect current Web root, root auth shell, Vercel config, CI launch E2E, README/product positioning, and launch marketing guardrails.
- [x] **T004** Run/record Architecture Graph preflight for `app/index.tsx`, `app/_layout.tsx`, and the reused first-run surfaces; confirm no tier escalation.
- [x] **T005** Produce `openband.json`, `spec.md`, `plan.md`, `tasks.md`, `checklist.md`, and `verification.md`.
- [x] **T006** Run Spec Kit analysis over the baseline; all 16 requirements have task coverage and no material contradiction or Constitution conflict remains.
- [x] **T007** Freeze Design Baseline SHA `e2ea8f8fd2ea192afcc395e30bb1bd53d81b2640` and record Human Design Gate approval in PR #69.

## Phase 2 — Public Web entry

- [x] **T101** Add a Web-only `/` landing surface and narrowly exempt only Web `/` from the existing unauthenticated root-shell redirect while preserving all other protected-route behavior and current non-Web entry navigation.
- [x] **T102** Implement launch copy from repository-owned messaging: product promise, Web alpha status, proof row, primary creation CTA, and source CTA.
- [x] **T103** Route the creation CTA into the existing auth/visitor → first-run flow without introducing a parallel auth/project path.
- [x] **T104** Make the source CTA open the canonical public repository.
- [x] **T105** Verify existing Web title/description/social metadata against the release contract; no new deployment/metadata architecture is required.

## Phase 3 — Release documentation and claim convergence

- [x] **T201** Add `docs/release/web-alpha.md` with canonical URL/revision fields, browser matrix, microphone/storage limitations, known limitations, data-boundary explanation, smoke steps, and rollback steps.
- [x] **T202** Reconcile README opening/status/capability claims against launch-grade evidence and link the release runbook.
- [x] **T203** Review `docs/product.md`; no change is required because its Web MVP/local-first/hosted-service boundaries already match the release contract.
- [x] **T204** Review launch-facing marketing copy for contradictions; existing guardrails and launch kit remain aligned, so strategy is unchanged.
- [x] **T205** Ensure release copy avoids universal offline/privacy behavior, mature-DAW parity, unlimited service capacity, unsupported-browser claims, and unverified competitor/pricing claims.

## Phase 4 — Focused automated proof

- [x] **T301** Add focused tests proving Web root is public, all other existing protected routes retain current unauthenticated redirect behavior, and non-Web root navigation remains unchanged.
- [x] **T302** Test primary CTA destination/integration and source CTA target.
- [x] **T303** Test visible alpha status and core claim copy at the public entry.
- [x] **T304** Preserve the existing `web-launch-e2e` contract; update it only if the new public root legitimately changes the deterministic launch navigation.
- [ ] **T305** Run focused tests, frontend/backend typecheck, Vitest, legacy tests, Web build, SDD checks, Graph checks, and launch Playwright on the exact implementation HEAD.

## Phase 5 — Convergence and release evidence

- [ ] **T401** Run Spec Kit convergence; append remediation tasks instead of silently weakening requirements.
- [ ] **T402** Run post-implementation Architecture Graph evidence and compare with preflight.
- [ ] **T403** Record exact candidate HEAD and CI run with all required jobs green.
- [ ] **T404** Deploy/promote the exact candidate revision through the existing Web/Vercel path.
- [ ] **T405** Record canonical deployed URL and verify revision identity as far as the current deployment mechanism exposes it.
- [ ] **T406** Run deterministic production smoke for landing → visitor → creation/import → persistence/reopen → WAV export.
- [ ] **T407** Run human real-microphone smoke on at least one browser intended to be labeled supported.
- [ ] **T408** Complete browser support matrix from actual release evidence; leave unproven combinations experimental/unverified.
- [ ] **T409** Name a concrete previous known-good revision/deployment and review the rollback + post-rollback smoke procedure.
- [ ] **T410** Reconcile README/product/release docs against the exact deployed candidate after evidence is known.

## Phase 6 — Merge gate and cleanup

- [ ] **T501** Confirm no required evidence is FAIL/BLOCKED/FLAKY and no review thread is blocking.
- [ ] **T502** Confirm PR is current with `master`, mergeable, and contains no temporary workflows/evidence scaffolding.
- [ ] **T503** Present Human Merge Gate against the exact verified PR HEAD and deployed candidate evidence.
- [ ] **T504** Human merges the PR; agent does not merge T2+.
- [ ] **T505** After merge, verify public release remains healthy and reconcile #51/#46 tracking state.
