# Richer MIDI Patterns & Genre Startup Test Suite — Spec

## Context

Project startup in OpenBand generates genre-specific MIDI patterns for drums, bass, leads, and pads (`projectTemplates.ts`). To ensure every genre and style features robust and diverse MIDI generation patterns with full test coverage, we need an advanced test suite and pattern refinements.

## Objectives

- Add `tests/projectTemplatesAdvanced.test.ts` to thoroughly test MIDI generation across all genres (`pop`, `rock`, `edm`, `hiphop`, `jazz`, `lofi`, `rnb`, `metal`, `acoustic`, `blues`) and track types (drums, bass, guitar, keys, synth_lead, pad, sample, vocal, fx).
- Verify note pitch boundaries (0-127), duration, and velocity ranges.
- Run graph architecture verification and code review.

## Success Criteria

- `tests/projectTemplatesAdvanced.test.ts` passes successfully.
- Graph CI validation (`graph:ci`) passes with zero errors.
- Code review via `code-review` subagent passes.
