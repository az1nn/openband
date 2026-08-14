# Autotune Tool Test Suite — Spec

## Context

OpenBand includes an immersive 3D/Web screen for pitch correction and Autotune (`app/autotune.tsx`). To ensure high reliability and thorough test coverage for pitch correction parameters, scale selections, and retune speeds, we need a dedicated test suite.

## Objectives

- Add `tests/autotuneTool.test.ts` or `tests/autotuneTool.test.tsx` testing pitch correction parameter states, scale configurations, and retune speed bindings.
- Verify graph architecture consistency and run CI checks.

## Success Criteria

- Autotune test suite passes successfully.
- Graph CI validation passes with zero errors.
