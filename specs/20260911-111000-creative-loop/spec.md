# Creative Loop Reliability

Issue: #47 · Launch umbrella: #46 · Tier: T2

## Goal

Make the existing blank-project Studio usable as a fast creative scratchpad on Web without changing persistence or DSP contracts.

## Acceptance

- A visitor can use the existing Library → New Project → Começar do Zero path without signup.
- An empty Studio presents obvious actions for recording, instrument, and samples; a new user can reach first sound in under 60 seconds in manual smoke.
- Web recording starts/stops reliably and the created region is immediately audible.
- A selected region can be moved, duplicated, deleted, and repeated without changing its source-audio semantics.
- Region edits participate in undo/redo and refresh audible playback consistently.
- Play/stop, BPM, metronome, mute/solo, volume, and pan remain functional in the same flow.
- Mic/recording interaction failures are visible and do not discard existing tracks.

## Non-goals

- Source-aware split/trim: #53.
- Persistence hardening: #48.
- Export correctness: #49.
- Full onboarding/release E2E: #50.
- Changes to `NewProject`, Library project creation, project storage, asset storage, or audio-rendering contracts.
