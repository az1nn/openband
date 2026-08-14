# Next Step D: Hardware MIDI Controller & MCU Support — Design

## Architecture
- **`src/lib/mcuController.ts`**: Implements Mackie Control Universal MIDI message decoder/encoder for 8-channel banks, master fader, and transport LEDs.
- **Web MIDI API**: Connects browser `navigator.requestMIDIAccess()` to hardware control surfaces.
- **Store Binding**: Binds MCU fader CCs to track volume and pan states.
