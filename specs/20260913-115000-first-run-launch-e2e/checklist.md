# Checklist — First-run and Launch E2E

## Design

- [x] Canonical Issue #50 and Launch MVP #46 revalidated.
- [x] Existing no-account visitor capability traced to `AuthContext.signInAsVisitor()`.
- [x] Current first-run blockers traced to login wording, genre-first onboarding and shallow E2E coverage.
- [x] Four required launch actions mapped to existing Studio capabilities.
- [x] Import design preserves browser user-activation requirements for file selection.
- [x] Existing #48 persistence and #49 export contracts are reused rather than duplicated.
- [x] Full deterministic E2E uses imported audible WAV instead of a fake microphone path.
- [x] Real microphone behavior remains a separate human release evidence gate.
- [x] PR CI gap identified: previous CI did not run Playwright.
- [x] Architecture Graph preflight completed and high-centrality surfaces documented.
- [x] T2 classification includes an explicit T3 escalation boundary.
- [x] No project schema, auth identity, persistence, bridge or DSP boundary change is planned.
- [x] Design baseline SDD / Graph validation passed on exact HEAD `3d1f26c73deeb3e7b804d155a02c707bbe9bbcc5`.
- [x] Human Design Gate approved for that exact design baseline.

## Implementation convergence

- [x] Visitor CTA is explicit: `Começar sem conta`.
- [x] First-run exposes exactly Record audio / Instrument / Drums-Sample / Import audio.
- [x] Existing Studio entrypoints are reused rather than reimplemented.
- [x] Import requires an explicit Studio click before opening the native file chooser.
- [x] Generic coachmark is suppressed for action-specific first-run routes.
- [x] Normal NewProject remains available as the advanced/secondary path.
- [x] Launch-critical Playwright is part of PR CI.
- [x] First Playwright execution caught a real desktop stacking bug; the product was fixed instead of forcing the click.
- [x] E2E checks durable `asset://` identity and non-empty IndexedDB asset bytes.
- [x] Post-implementation Graph impact completed; semantic scope remains T2.
- [ ] Final exact-HEAD CI is green, including launch Playwright.
- [ ] Real-microphone Web smoke is green and recorded against the exact verified HEAD.
- [ ] Human Merge Gate is approved.
