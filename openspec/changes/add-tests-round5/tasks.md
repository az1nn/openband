# Tasks: Fifth Round of Unit Tests and Validation

- [ ] 1. Add Live Modulation Route Application test cases in `tests/modulationMatrix.test.ts` (testing `registerLiveModParam`, `applyLiveModulation`, and engine tick behavior).
- [ ] 2. Add Transport Replay Reset test cases in `tests/transport.test.ts` or `tests/studio-audio-pure.test.ts` (testing `onEnded` resetting position to 0 vs explicit pause preserving position).
- [ ] 3. Add Library Lightweight Index Cover URL test cases in `tests/cloudSync.test.ts` or `tests/projectCover.test.ts` (testing that index metadata stores and retrieves `coverUrl` without full decodes).
- [ ] 4. Run `npx vitest run` to verify all test suites pass successfully.
