# Verification Gate

Verification is not yet PASS. This document defines the evidence required after implementation.

Required evidence on one exact implementation HEAD:

- deterministic WAV fixture: RIFF/WAVE, non-empty data, audible PCM;
- mute/solo/volume/pan fidelity;
- MIDI-only audible export;
- deterministic track/master effect coverage;
- explicit missing/corrupt `asset://` failure with unchanged project state;
- browser WAV smoke using persisted local assets;
- frontend/backend typecheck;
- targeted + full Vitest / legacy tests;
- Web build;
- `sdd:check`;
- Graph tests / `graph:ci`.

Any product-code HEAD change after verification invalidates affected evidence and must be rerun before Human Merge Gate.
