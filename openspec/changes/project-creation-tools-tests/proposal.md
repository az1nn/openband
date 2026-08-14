# Project Creation Tools Test Suite — Spec

## Context

OpenBand supports project creation by genre, mood, time signature, BPM range, and musical key (`projectTemplates.ts`, `projectStarter.ts`, `NewProject.tsx`). To ensure thorough test coverage across all project initialization parameters and genres, we need dedicated advanced test cases.

## Objectives

- Add `tests/projectCreationAdvanced.test.ts` to test all genres (`GENRES`), time signatures, key signatures, mood scales, and edge-case project starter configurations.
- Verify robust clamping and track generation logic.

## Success Criteria

- `tests/projectCreationAdvanced.test.ts` passes successfully.
- Graph CI verification passes.
