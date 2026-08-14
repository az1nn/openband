# Next Step D: Hardware MIDI Controller & MCU Support — Proposal

## Context
OpenBand has MIDI learning panels (`MidiLearnPanel.tsx`), but lacks Mackie Control Universal (MCU) protocol support for physical motorized faders and control surface banks.

## Objectives
- Implement MCU parser and encoder (`mcu.ts`).
- Map physical fader movements, mute/solo buttons, and transport keys to DAW tracks.
- Add unit tests for MCU SysEx and pitchbend message translation.
