# Tasks — First-run and Launch E2E

## Preflight / design

- [x] Revalidate canonical `master`, Issue #50, umbrella #46 and open PR state.
- [x] Reconstruct L0/L1 context from Constitution, `AGENTS.md`, AI instructions, prior launch-trust features and relevant code.
- [x] Confirm no existing Spec Kit feature or active PR for #50.
- [x] Inspect visitor auth, login, onboarding, project creation, Studio entrypoints, import persistence and current Playwright coverage.
- [x] Run Architecture Graph preflight on likely touched production surfaces.
- [x] Classify as T2 with explicit T3 escalation boundary.
- [x] Run design SDD / Graph checks on exact clean design HEAD.
- [x] Human Design Gate approval on exact design baseline.

## Implementation

- [x] Make the no-account visitor entry explicit without changing visitor-session semantics.
- [x] Replace first-run genre-first gate with four primary creative actions: Record audio, Instrument, Drums / sample, Import audio.
- [x] Create/open a scratch local project with safe defaults from each first-run action.
- [x] Route Record to existing record options.
- [x] Route Instrument to existing Synth.
- [x] Route Drums / sample to existing Sampler.
- [x] Route Import to an action-aware Studio CTA that invokes the existing persistent import flow on a real user click.
- [x] Ensure generic onboarding coachmarks do not obstruct action-specific entry.
- [x] Preserve the normal NewProject genre/mood wizard outside the first-run shortcut.
- [x] Add stable accessibility/test selectors only where needed to exercise real controls.
- [x] Add focused tests for all four action dispatches.
- [x] Add deterministic full Playwright launch journey using an audible generated WAV fixture.
- [x] Add launch-critical Playwright execution to PR CI without masking failures.
- [x] Fix the desktop onboarding stacking defect found by the first launch E2E run instead of bypassing it in Playwright.
- [x] Assert the imported `asset://` object has non-empty IndexedDB bytes before and after reload.

## Verification

- [ ] Prove no-account entry → first-run action works from clean storage on the final exact HEAD.
- [ ] Prove imported WAV reaches durable `asset://` storage with non-empty IndexedDB bytes on the final exact HEAD.
- [ ] Prove one real edit persists across reload/reopen on the final exact HEAD.
- [ ] Prove real Bounce export downloads valid audible RIFF/WAVE on the final exact HEAD.
- [ ] Record and assert automated first-sound `<60s` and export `<10m` timing targets on the final exact HEAD.
- [ ] Run focused tests, full Vitest, legacy tests, frontend/backend typecheck and Web build on the final exact HEAD.
- [ ] Run `sdd:check`, Graph tests and `graph:ci` on the final exact HEAD.
- [x] Re-run Architecture Graph impact for touched production surfaces and confirm T2 remains valid.
- [ ] Record exact verified PR HEAD.
- [ ] Human real-microphone Web smoke: record → stop → play → reload/reopen → export.

## Merge / cleanup

- [ ] Human Merge Gate on exact verified HEAD after microphone evidence.
- [ ] Human merge only.
- [ ] Close #50 as completed only after merged `master` is revalidated.
- [ ] Update umbrella #46 status without rewriting historical feature artifacts.
