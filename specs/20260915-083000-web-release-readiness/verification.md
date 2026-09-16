# Verification — Web Release Readiness

## Evidence policy

Required states are `PASS`, `FAIL`, `BLOCKED`, `FLAKY`, or `NOT_REQUIRED`. A required `FAIL`, `BLOCKED`, or `FLAKY` blocks Human Merge Gate. Release evidence is valid only when it identifies the exact PR HEAD or deployed revision it verifies.

Human-only checks are tracked durably in [`docs/release/human-validation-pending.md`](../../../docs/release/human-validation-pending.md). A deferred human test remains `BLOCKED`/pending release evidence; it is never inferred as PASS from automation.

## Design-stage evidence

| Evidence | State | Notes |
| --- | --- | --- |
| Issue / feature | PASS | #51 / `20260915-083000-web-release-readiness` |
| Tier | PASS | T2; explicit T3/T4 escalation boundaries |
| Graph preflight | PASS | runs `34963915926` + `34964085935`: root MEDIUM/0, root shell MEDIUM/1, login MEDIUM/2, Feed HIGH/91, Onboarding HIGH/93 |
| Spec Kit analyze | PASS | 16/16 requirements covered; no material inconsistency or Constitution conflict |
| Human Design Gate | PASS | approved in PR #69 against baseline `e2ea8f8fd2ea192afcc395e30bb1bd53d81b2640` before product implementation |

## Implementation convergence

The approved implementation remains bounded to:

- public Web `/` landing;
- a Web-root-only auth-shell exception using `pathname === "/"`;
- primary CTA reuse of `/login` → existing visitor flow → existing first-run;
- canonical source CTA;
- focused route/landing/auth-shell tests;
- launch E2E adaptation to include landing → Start creating;
- Web alpha release/runbook and README claim convergence.

No AuthContext identity/session semantics, project/persistence ownership model, `asset://` contract, export/DSP, backend topology, runtime bridge, or production credential design changed.

Convergence exposed real defects and each was fixed in product code rather than hidden in tests:

- root detection used a fragile segments assumption; it was replaced by `usePathname() === "/"`;
- the public landing CTA had invalid Web hit geometry/stacking and was given explicit Web-safe layout/stacking;
- first-run onboarding actions were trapped in Feed layout/hit-testing and were portalized with the existing React Native `Modal` pattern;
- project title was persisted but not hydrated on reload; `hydrateProject()` now restores `saved.title` when present.

The launch E2E was not weakened to bypass any of these failures.

## Post-implementation Architecture Graph

Temporary evidence run `35006469726` on implementation + measurement workflow passed:

- graph: 510 nodes / 1377 edges;
- `app/index.tsx`: MEDIUM / blast radius 1;
- `app/_layout.tsx`: MEDIUM / 1;
- `src/components/WebLaunchLanding.tsx`: MEDIUM / 3;
- `app/(auth)/login.tsx`: MEDIUM / 2;
- `app/tabs/index.tsx`: HIGH / 91;
- `src/components/OnboardingFlow.tsx`: HIGH / 93.

The HIGH reused surfaces retain their pre-existing centrality. No new cross-runtime, auth identity/session, persistence ownership, export/DSP, backend, security, or deployment-topology coupling was introduced; no tier escalation is required. The temporary workflow was removed after evidence collection.

## Automated candidate verification

Product-code candidate `582889e238fe65afe2b627d3e91365a969344e6e` completed OpenBand CI V2 run `35026016724` with conclusion `success`.

| Check | State | Evidence |
| --- | --- | --- |
| `npm run sdd:check` | PASS | CI `35026016724` graph-check |
| `npm run test:graph-sdd` | PASS | CI `35026016724` graph-check |
| `npm run graph:ci` | PASS | CI `35026016724` graph-check |
| frontend TypeScript check | PASS | CI `35026016724` |
| backend TypeScript check | PASS | CI `35026016724` |
| full Vitest | PASS | CI `35026016724` |
| legacy tests | PASS | CI `35026016724` |
| production Web build | PASS | CI `35026016724` |
| `web-launch-e2e` | PASS | CI `35026016724`; landing → visitor → import → persistence/reload → WAV export |
| focused Web landing/root-auth-shell tests | PASS | full Vitest on CI `35026016724` |
| focused primary/source CTA tests | PASS | full Vitest on CI `35026016724` |

Android and Electron jobs were only the expected conditional skips.

Documentation reconciliation after this product-code candidate changes the PR HEAD without changing runtime behavior. Human Merge Gate still requires a clean CI on the final documentation-reconciled PR HEAD; the exact final SHA is recorded in the PR conversation at gate time rather than self-referentially inside this file.

## Vercel candidate

GitHub commit status for `582889e238fe65afe2b627d3e91365a969344e6e` recorded Vercel deployment `5wmHeQysZVPDE5vnxadKrX3Dvec3` as completed successfully.

This proves a Vercel deployment exists for the automated candidate. It does **not** by itself prove that the canonical production URL is currently promoted to that SHA. Promotion/canonical URL identity remains release evidence to capture before Human Merge Gate.

## Deployed release smoke

State: **PENDING HUMAN / DEPLOYED-IDENTITY VALIDATION**.

Before Merge Gate record canonical URL, exact deployed SHA, deployment identifier, date/time, browser/version/OS, and PASS/FAIL/BLOCKED per step:

1. `/` loads the public launch entry without a session.
2. `Web alpha` and `Make music. Keep the project.` are visible.
3. **Start creating** enters the existing login/visitor path.
4. **Começar sem conta** succeeds.
5. One launch path reaches audible material.
6. A persisted edit survives reload/reopen.
7. WAV export is valid and audible.
8. **View source** resolves to the canonical repository.
9. Permission/storage/export failures remain explicit.
10. An existing protected route still redirects unauthenticated visitors under the existing auth contract.

The execution checklist and evidence template live in `docs/release/human-validation-pending.md`.

## Real microphone evidence

State: **PENDING HUMAN**.

At least one desktop browser intended to be labeled `SUPPORTED` must complete, against the exact deployed candidate:

**landing → Start creating → Começar sem conta → Gravar áudio → grant mic → record audible material → stop → playback → reload/reopen → playback → WAV export**

Imported-audio CI does not replace this evidence. Deferral is allowed operationally, but support cannot be upgraded and Human Merge Gate cannot pass until the evidence exists.

## Browser evidence

Current evidence state:

- Chromium desktop: `EXPERIMENTAL` — deterministic Playwright launch/reload/export PASS; real microphone/audible deployed smoke pending.
- Firefox desktop: `UNVERIFIED`.
- Safari desktop: `UNVERIFIED`.
- Mobile browsers: `UNVERIFIED` for this release proof.
- Electron / Android / iOS public releases: `UNVERIFIED`.

Use only:

- `SUPPORTED` — complete release-specific smoke including microphone evidence;
- `EXPERIMENTAL` — partial/automated evidence or a material limitation remains;
- `UNVERIFIED` — no release claim.

## Claim reconciliation

README, landing, product docs and release runbook must not claim mature desktop-DAW parity, universal offline operation, blanket "everything stays local" privacy, unlimited hosted capacity, unimplemented pricing, unsupported browsers, or unverified native releases.

## Rollback evidence

Concrete previous known-good baseline:

- revision: `2aa887e3bd2ab4643407ae96532966ec1fed9767` — merged #50 / PR #67 first-run launch journey;
- GitHub commit status: Vercel deployment completed successfully;
- Vercel deployment identifier: `BvCLtXBmtRY4iuofRi3pTkYWxRDB`.

Rollback remains promotion/restoration of that known-good revision/deployment through the existing Vercel/Git mechanism, followed by entry → visitor → persistence/reopen → export smoke. No incident-time source edit is part of the rollback procedure.

The rollback target is concrete; post-rollback smoke is required only if rollback is actually executed.

## Human Merge Gate

Current state: **BLOCKED by intentionally deferred human/deployed validation, not by a known automated failure**.

Present the gate only when:

- the final documentation-reconciled PR HEAD has a clean CI;
- canonical deployed revision identity is known;
- the human checklist in `docs/release/human-validation-pending.md` has required PASS evidence for at least one intended supported desktop browser;
- real microphone + audible playback/export pass;
- browser/limitations and rollback evidence are concrete;
- documentation is reconciled;
- no blocking review remains;
- the PR is current/mergeable;
- no temporary evidence workflow remains.

Merge remains human-only.