# Proposal: Add Unit Tests for Recent Fixes in OpenBand

## Context
OpenBand has received several robust fixes across audio mastering true-peak calculation, clock manager worker lifecycle, audio graph cycle validation for missing sources, and modulation matrix unipolar symmetric mapping. To maintain high code quality and regression safety, comprehensive Vitest test coverage is required for these specific areas.

## Objectives
1. **Mastering True-Peak / FIR Oversampling**: Verify that inter-sample peaks are accurately captured by the 4× oversampling low-pass filter and not under-reported.
2. **Clock Manager Interval Update**: Test calling `startClock(newInterval)` while already running to ensure the worker safely terminates and restarts with the new interval without leaking or duplicating worker instances.
3. **Graph Validation Missing Source**: Test `wouldCreateCycle` when `fromId` is missing from the graph to ensure it correctly returns `{ valid: false, errorMessage: ... }`.
4. **Modulation Unipolar Symmetric**: Test unipolar modulation (`bipolar: false`) at source values `0`, `0.5`, and `1.0` to verify correct symmetric mapping (`-amount`, `0`, `+amount`).
