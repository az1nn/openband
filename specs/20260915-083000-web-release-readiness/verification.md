# Verification — Web Release Readiness

## Evidence policy

Required states are `PASS`, `FAIL`, `BLOCKED`, `FLAKY`, or `NOT_REQUIRED`. A required `FAIL`, `BLOCKED`, or `FLAKY` blocks Human Merge Gate. Release evidence is valid only when it identifies the exact PR HEAD or deployed revision it verifies.

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

No AuthContext identity/session semantics, project/persistence ownership, `asset://` contract, export/DSP, backend topology, runtime bridge, or production credential design changed.

The first implementation CI exposed a real TypeScript defect in root detection (`segments.length === 0`). It was fixed by using `usePathname() === "/"`; the failed check was not masked or weakened.

## Post-implementation Architecture Graph

Temporary evidence run `35006469726` on implementation + measurement workflow passed:

- graph: 510 nodes / 1377 edges;
- `app/index.tsx`: MEDIUM / blast radius 1;
- `app/_layout.tsx`: MEDIUM / 1;
- `src/components/WebLaunchLanding.tsx`: MEDIUM / 3;
- `app/(auth)/login.tsx`: MEDIUM / 2;
- `app/tabs/index.tsx`: HIGH / 91;
- `src/components/OnboardingFlow.tsx`: HIGH / 93.

The HIGH reused surfaces retain their pre-existing centrality. No new cross-runtime, auth identity/session, persistence, export/DSP, backend, security, or deployment-topology coupling was introduced; no tier escalation is required. The temporary workflow was removed after evidence collection.

## Automated candidate verification

The exact final PR HEAD must pass:

| Check | Required state |
| --- | --- |
| `npm run sdd:check` | PASS |
| `npm run test:graph-sdd` | PASS |
| `npm run graph:ci` | PASS |
| frontend TypeScript check | PASS |
| backend TypeScript check | PASS |
| full Vitest | PASS |
| legacy tests | PASS |
| production Web build | PASS |
| `web-launch-e2e` | PASS |
| focused Web landing/root-auth-shell tests | PASS |
| focused primary/source CTA tests | PASS |

Evidence from an earlier HEAD is informative only; final Merge Gate requires a clean run on the exact final HEAD after SDD evidence reconciliation.

## Vercel candidate

The branch preview is automatically deployed by the existing Vercel integration. GitHub evidence recorded preview deployment `32nqkhBmhrXTrqvfejzdZeETwuUT` as Ready during implementation. This is preview evidence, not proof that the canonical production URL serves the final PR HEAD.

## Deployed release smoke

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

## Real microphone evidence

At least one desktop browser intended to be labeled `SUPPORTED` must complete, against the exact deployed candidate:

**landing → Start creating → Começar sem conta → Gravar áudio → grant mic → record audible material → stop → playback → reload/reopen → playback → WAV export**

Imported-audio CI does not replace this evidence.

## Browser evidence

Use only:

- `SUPPORTED` — complete release-specific smoke including microphone evidence;
- `EXPERIMENTAL` — partial/automated evidence or a material limitation remains;
- `UNVERIFIED` — no release claim.

## Claim reconciliation

README, landing, product docs and release runbook must not claim mature desktop-DAW parity, universal offline operation, blanket "everything stays local" privacy, unlimited hosted capacity, unimplemented pricing, unsupported browsers, or unverified native releases.

## Rollback evidence

Before Merge Gate record a concrete previous known-good Web revision/deployment. The runbook must restore/promote that existing deployment without incident-time code editing, verify the canonical URL, and rerun entry → visitor → persistence/reopen → export smoke.

## Human Merge Gate

Present only when the exact final PR HEAD is green, the intended deployed revision is identified and smoked, real-microphone evidence passes for at least one supported browser, browser/limitations and rollback evidence are concrete, documentation is reconciled, no blocking review remains, the PR is current/mergeable, and no temporary evidence workflow remains.

Merge remains human-only.
