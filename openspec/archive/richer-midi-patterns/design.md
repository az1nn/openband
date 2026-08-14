# Richer MIDI Patterns & Genre Startup Test Suite — Design

## 1. Test Coverage (`tests/projectTemplatesAdvanced.test.ts`)
- Call `generateTracksForGenre` for every registered genre in `GENRES`.
- Assert that every track generated contains valid `midiNotes` with `pitch` between 0 and 127, positive duration, and valid velocity (1-127).
- Test drum patterns and harmonic chord progressions across different moods and time signatures.
- Verify fallback track generation.
