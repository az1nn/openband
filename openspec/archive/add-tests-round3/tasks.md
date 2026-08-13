# Tasks: Add Third Round of Unit Tests and Validation

- [ ] 1. Create spec files (`proposal.md`, `design.md`, `tasks.md`) under `openspec/changes/add-tests-round3/` and commit spec.
- [ ] 2. Add unit test for `renderMixdownWeb` with buses and aux sends in `tests/audioExport.test.ts`.
- [ ] 3. Add unit test for multi-channel WAV decoding and stereo routing in `tests/audioExport.test.ts`.
- [ ] 4. Add unit test for unknown plugin warnings in `tests/plugins/dsp.test.ts` / `tests/audioExport.test.ts`.
- [ ] 5. Run `npx vitest run` to verify all tests pass successfully.
- [ ] 6. Leave implementation and test files uncommitted for code review.
