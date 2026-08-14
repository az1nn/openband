# Comprehensive Plugin Suite Test Suite — Spec

## Context

OpenBand defines 20 distinct audio plugin types (`eq`, `compressor`, `limiter`, `distortion`, `reverb`, `delay`, `filter`, `modulation`, `utility`, `multibandCompressor`, `stereoImager`, `deesser`, `tapeSaturator`, `truePeakLimiter`, `noiseGate`, `autoPitch`, `bassMono`, `stereoWidener`, `clipper`, `voiceCleaner`). To ensure every plugin has robust test coverage for parameter specifications, presets, and serialization, we need a dedicated comprehensive test suite.

## Objectives

- Add `tests/plugins/allPlugins.test.ts` to test parameter specs, default values, presets, and serialization for all 20 plugin types.
- Verify graph architecture consistency and run CI checks.

## Success Criteria

- `tests/plugins/allPlugins.test.ts` passes successfully.
- Graph CI validation (`graph:ci`) passes with zero errors.
