# Design Checklist — First-run and Launch E2E

- [x] Canonical Issue #50 and Launch MVP #46 revalidated.
- [x] Existing no-account visitor capability traced to `AuthContext.signInAsVisitor()`.
- [x] Current first-run blockers traced to login wording, genre-first onboarding and shallow E2E coverage.
- [x] Four required launch actions mapped to existing Studio capabilities.
- [x] Import design preserves browser user-activation requirements for file selection.
- [x] Existing #48 persistence and #49 export contracts are reused rather than duplicated.
- [x] Full deterministic E2E uses imported audible WAV instead of a fake microphone path.
- [x] Real microphone behavior remains a separate human release evidence gate.
- [x] PR CI gap identified: current CI does not run Playwright.
- [x] Architecture Graph preflight completed and high-centrality surfaces documented.
- [x] T2 classification includes an explicit T3 escalation boundary.
- [x] No project schema, auth identity, persistence, bridge or DSP boundary change is planned.
- [ ] Design baseline SDD / Graph validation passes on exact HEAD.
- [ ] Human Design Gate approved for exact design baseline SHA.
