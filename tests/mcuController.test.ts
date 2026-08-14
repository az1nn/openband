import { describe, it, expect } from "vitest";
import { MCUController } from "../src/lib/mcuController";

describe("Hardware MIDI Controller & MCU Support Suite", () => {
  it("manages channel fader positions and decodes MCU SysEx messages", () => {
    const mcu = new MCUController();
    mcu.setFader(0, 100);
    expect(mcu.getChannel(0)?.faderPosition).toBe(100);

    const validSysex = [0xf0, 0x00, 0x00, 0x66, 0x14, 0xf7];
    expect(mcu.decodeSysex(validSysex)).toBe(true);

    const invalidSysex = [0xb0, 0x07, 64];
    expect(mcu.decodeSysex(invalidSysex)).toBe(false);
  });
});
