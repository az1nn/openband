# Plan — Web Release Readiness

## Classification

**Tier:** T2  
**Issue:** #51  
**Parent:** #46  
**Depends on:** #47 Creative Loop, #48 Persistence Trust, #49 Export Trust, #50 First-run / Launch E2E

This feature packages the proven Web MVP into a public release surface. It does not own new music-engine behavior. The implementation must stay inside existing Web navigation, documentation, release verification, and current Vercel export topology.

ADR: **NOT REQUIRED** while the implementation preserves current deployment/runtime contracts. Create or update an ADR only if release work reveals a durable deployment or runtime decision not already represented by current architecture.

## T3/T4 escalation boundary

Stop and reclassify before implementation if the work requires:

- a new hosting/deployment topology or backend routing boundary;
- authentication identity/session changes or protection-semantics changes beyond the single public Web root;
- project schema, persistence ownership, or durable asset identity changes;
- export renderer/DSP changes;
- Web/native bridge changes;
- production credential/security design changes;
- destructive migration, recovery, or credible data-loss behavior.

Security-sensitive credential handling or data-loss/recovery changes are T4 triggers.

## Design

### 1. Web-only public root

`app/index.tsx` becomes a platform-aware entry:

- Web renders a small release landing surface.
- Native/non-Web keeps the current direct app navigation behavior.
- The landing is intentionally shallow: promise, alpha status, proof row, one primary CTA, one source CTA, and concise limitation/trust links.

The existing `RootLayoutProtected` currently redirects every unauthenticated non-auth route to `/login`. To make the landing genuinely public, `app/_layout.tsx` must exempt **only** the Web root route from that redirect. All other route protection and all session/visitor identity semantics remain unchanged. This is route orchestration, not a new authentication contract.

Prefer a focused component under `src/components/` if keeping the route file small improves testability. Do not turn the release landing into another feature inventory.

### 2. Canonical launch message

Use the repository-owned marketing baseline rather than inventing a new positioning system:

- headline: **Make music. Keep the project.**
- category: open-source browser music studio;
- core proof: Web first, local-first projects, free core creation, open source;
- primary CTA: **Start creating**;
- secondary CTA: **View source**;
- visible maturity: **Web alpha**.

Copy must follow `docs/marketing/messaging.md` and `docs/marketing/launch-kit.md`. Claims that require measured evidence remain absent until measured.

### 3. CTA integration

The primary CTA enters the existing auth/visitor path, then the #50 first-run path. It must not create a new anonymous identity, project schema, starter, persistence path, or Studio boot contract.

The source CTA opens the canonical `az1nn/openband` repository through a normal Web link / existing cross-platform linking primitive.

### 4. Release documentation

Add a concise Web release document, expected under `docs/release/`, that records:

- release maturity/status;
- canonical public URL;
- exact candidate/deployed Git revision;
- browser support matrix with evidence states;
- microphone permission caveats;
- browser storage/quota/private-mode caveats;
- local-first versus optional hosted data-flow language;
- known limitations;
- release smoke procedure;
- rollback procedure;
- post-rollback smoke.

This document is operational evidence, not marketing prose.

### 5. README/product convergence

Review `README.md`, `docs/product.md`, and launch-facing marketing docs for claims that exceed the release evidence. Keep expansion capabilities visible only when labeled as expanding, experimental, build-from-source, or configuration-dependent.

The README opening should stay user-first and point to the public Web release and release limitations.

### 6. Browser verification

Verification must distinguish evidence states:

- `SUPPORTED` — release-specific smoke evidence exists;
- `EXPERIMENTAL` — known to work partially or without full release proof;
- `UNVERIFIED` — no release claim.

At minimum, the candidate release must have one fully supported desktop Web path covering visitor start, microphone permission/recording, persistence/reopen, and WAV export. Additional browsers are labeled only from evidence.

Automated Playwright remains deterministic and Chromium-based unless the approved design is explicitly expanded. Manual evidence fills real-microphone/browser permission gaps.

### 7. Deployment identity and rollback

Reuse current Vercel deployment behavior. Release evidence records the exact Git SHA exposed at the promoted deployment and the previous known-good release SHA/deployment.

Rollback is operational, not a code patch:

1. identify prior known-good revision/deployment;
2. restore/promote that revision using the existing Vercel/Git deployment mechanism;
3. verify public URL resolves to the expected revision;
4. rerun a short launch smoke;
5. record result.

Do not add automatic rollback machinery in this slice unless separately approved.

### 8. CI continuity

The existing CI contract remains intact:

- SDD / Graph checks;
- frontend typecheck;
- backend typecheck;
- Vitest;
- legacy tests;
- Web build;
- `web-launch-e2e`.

Add only focused landing/auth-shell/release-document tests needed to prove new behavior. Do not weaken or duplicate the #50 E2E.

## Architecture Graph preflight

Run `34963915926` on the initial design branch produced a 507-node / 1373-edge graph:

- `app/index.tsx`: MEDIUM, blast radius 0;
- `app/(auth)/login.tsx`: MEDIUM, blast radius 2;
- `app/tabs/index.tsx`: HIGH, blast radius 91;
- `src/components/OnboardingFlow.tsx`: HIGH, blast radius 93.

After preflight exposed the root-auth-shell constraint, run `34964085935` measured `app/_layout.tsx` as MEDIUM with blast radius 1 (its direct/transitive dependent is the existing layout test).

The HIGH results are existing shared-surface centrality. The approved design does not require structural changes to Feed or Onboarding. The only auth-shell change is a narrow Web-root public-route exception; identity/session ownership remains untouched.

### Graph interpretation

The semantic tier remains **T2**. Graph evidence does not show a cross-runtime or persistence blast radius that requires T3. Elevate before implementation if the root-shell change broadens protection semantics, changes identity/session ownership, or creates a new runtime/deployment boundary.

## Expected implementation surface

Likely production/docs surface:

- `app/index.tsx`
- `app/_layout.tsx` — narrowly scoped public-Web-root exception only
- optional focused landing component under `src/components/`
- focused landing/auth-shell tests under `tests/`
- `README.md`
- `docs/product.md` only where release wording needs convergence
- new `docs/release/web-alpha.md` (or equivalent concise runbook)
- existing marketing docs only if a contradiction is found

Expected unchanged ownership:

- `src/context/AuthContext.tsx`
- login/visitor identity implementation
- project persistence and `asset://` contracts
- Studio save/reopen implementation
- export renderer / DSP
- backend deployment architecture
- native bridge contracts

## Verification strategy

Before Human Merge Gate, exact candidate HEAD must pass:

1. `npm run sdd:check`;
2. `npm run test:graph-sdd`;
3. `npm run graph:ci`;
4. frontend TypeScript check;
5. backend TypeScript check;
6. full Vitest;
7. legacy tests;
8. production Web build;
9. launch-critical Playwright;
10. focused landing/auth-shell/CTA tests, including proof that only Web `/` is public and other protected routes retain current behavior;
11. deployed release smoke on the canonical URL;
12. human real-microphone smoke on a browser recorded as supported;
13. documentation/claim reconciliation against exact deployed HEAD;
14. rollback procedure review with a concrete previous known-good revision.

Required evidence may be PASS, FAIL, BLOCKED, FLAKY, or NOT_REQUIRED. FAIL/BLOCKED/FLAKY blocks the gate.

## Human gates

The Design Baseline includes `spec.md`, this plan, `tasks.md`, `checklist.md`, and the verification strategy. Implementation begins only after Human Design Gate approval on the exact baseline SHA.

After implementation and convergence, the final deployed candidate and exact PR HEAD must be verified before Human Merge Gate. Merge remains human-only.
