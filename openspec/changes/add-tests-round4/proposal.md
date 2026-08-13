# Proposal: Add Fourth Round of Unit Tests and Validation

## Context
Ensure maximum test coverage and robustness across remaining OpenBand modules, specifically focusing on lightweight project metadata persistence (`parentProjectId`), native audio pure-JS multi-bit-depth decoding across various PCM formats, and audio graph validation edge cases for missing nodes in `wouldCreateCycle`.

## Objectives
1. **Collabs Tab Lightweight Metadata**: Verify that `listProjectIndex()` correctly persists and returns `parentProjectId` for collaborative filtering without full-decode.
2. **Native Audio Decode Pure-JS Multi-Bit-Depth**: Comprehensive unit testing of pure-JS WAV decoding across 8-bit unsigned, 24-bit signed 3-byte LE, and 32-bit float PCM WAV formats.
3. **Graph Validation Missing Source/Target**: Test `wouldCreateCycle` edge cases when multiple source and target routes interact with missing or invalid nodes.
