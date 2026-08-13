# Proposal: Add Fifth Round of Unit Tests and Validation for Remaining OpenBand Modules

## Context & Objectives
To ensure maximum test coverage and robustness across the OpenBand codebase, this proposal introduces a fifth round of targeted unit tests in Vitest. 

The focus areas for this round are:
1. **Live Modulation Route Application (`tests/modulationMatrix.test.ts`)**: Validate that `startModulationEngine` / `applyLiveModulation` correctly registers and computes live volume/pan modulation routes against the transport clock.
2. **Transport Replay Reset (`tests/studio-audio-pure.test.ts` or `tests/transport.test.ts`)**: Validate playback engine behavior where `onEnded` resets `currentSeekRef` to 0 while explicit pause preserves the current playback position.
3. **Library Lightweight Index Cover URL (`tests/cloudSync.test.ts` or `tests/lib.test.ts`)**: Validate that index metadata correctly stores and retrieves `coverUrl` for `ProjectCard` rendering without requiring full project decodes.

## Scope
- Add test suites in `tests/modulationMatrix.test.ts`, `tests/transport.test.ts`, and `tests/cloudSync.test.ts` (or equivalent test files).
- Run vitest verification.
