---
name: openband-tdd
description: Behavior-driven red-green-refactor workflow for audio math, CRDT state, components, and backend endpoints.
---

# OpenBand TDD — Test-Driven Development

Executes behavior-driven Red-Green-Refactor development for audio DSP math, CRDT state transforms, UI components, and API routes.

## Red-Green-Refactor Loop

1. **RED**: Write a failing unit test asserting desired behavior.
   - **Frontend / DSP / CRDT**: `npx vitest run tests/<feature>.test.ts`
   - **Legacy Node Suite**: `npm run test:legacy`
   - Confirm test fails for expected reason.

2. **GREEN**: Write minimal code to make the test pass.
   - Focus on correctness over optimization.
   - Ensure zero regressions in existing test suite.

3. **REFACTOR**: Clean up code while keeping tests green.
   - Remove duplication, enforce boundary separation, enhance readability.
   - Ensure test suite execution time remains fast.
