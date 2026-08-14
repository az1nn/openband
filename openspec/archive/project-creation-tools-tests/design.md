# Project Creation Tools Test Suite — Design

## 1. Test Coverage (`tests/projectCreationAdvanced.test.ts`)
- Test every genre in `GENRES` for valid default BPMs, track assignments, and mood vectors.
- Test `setupProjectStarter` with combinations of time signatures (`4/4`, `3/4`, `6/8`), keys (`C`, `F#`, `Am`, etc.), and numBars clamping (1 to 64).
- Test start-from-scratch initialization.
