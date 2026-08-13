# Tasks: Add Unit Tests for Recent Fixes

- [ ] Create OpenSpec change proposal, design, and tasks files
- [ ] Commit spec files to git
- [ ] Add unit test case for inter-sample peak / FIR oversampling in `tests/lufs.test.ts`
- [ ] Add unit test case for clock manager restart / interval update in `tests/lib3.test.ts`
- [ ] Add unit test case for audio graph validation with missing source in `tests/lib3.test.ts`
- [ ] Add unit test case for modulation unipolar symmetric mapping (`0`, `0.5`, `1.0`) in `tests/modulationMatrix.test.ts`
- [ ] Run `npx vitest run` via WSL node and verify all tests pass successfully
- [ ] Leave test files uncommitted for code review
