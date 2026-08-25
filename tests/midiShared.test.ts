import { describe, it, expect, beforeEach } from "vitest";
import {
  bindMidi,
  applyMidiMessage,
  getBindings,
  unbindMidi,
  setMidiTargetHandler,
  loadMidiMap,
  MCU_MAP,
  applyMcuPreset,
} from "../src/lib/midiShared";

describe("midiShared (M16 coverage)", () => {
  beforeEach(() => {
    loadMidiMap();
    setMidiTargetHandler(null);
  });

  it("bindMidi / getBindings / unbindMidi manage the map with key format", () => {
    bindMidi({ type: "trackVolume", trackIndex: 0 }, 7, 0, "cc");
    const bindings = getBindings();
    expect(bindings.length).toBe(1);
    expect(bindings[0].key).toBe("cc:0:7");
    expect(bindings[0].binding.target.type).toBe("trackVolume");
    unbindMidi("cc:0:7");
    expect(getBindings().length).toBe(0);
  });

  it("applyMidiMessage dispatches CC to handler with normalized value", () => {
    bindMidi({ type: "trackVolume", trackIndex: 2 }, 7, 0, "cc");
    const received: { t: unknown; v: number }[] = [];
    setMidiTargetHandler((t, v) => received.push({ t, v }));
    applyMidiMessage([0xb0, 7, 64]);
    expect(received.length).toBe(1);
    expect(received[0].v).toBeCloseTo(64 / 127);
    expect((received[0].t as { type: string }).type).toBe("trackVolume");
    expect((received[0].t as { trackIndex: number }).trackIndex).toBe(2);
  });

  it("applyMidiMessage dispatches note-on to handler with value 1", () => {
    bindMidi({ type: "transport", action: "togglePlay" }, 91, 0, "note");
    const received: { t: unknown; v: number }[] = [];
    setMidiTargetHandler((t, v) => received.push({ t, v }));
    applyMidiMessage([0x90, 91, 100]);
    expect(received.length).toBe(1);
    expect(received[0].v).toBe(1);
    expect((received[0].t as { action: string }).action).toBe("togglePlay");
  });

  it("applyMidiMessage ignores unbound messages", () => {
    const received: unknown[] = [];
    setMidiTargetHandler((t, v) => received.push({ t, v }));
    applyMidiMessage([0xb0, 99, 10]);
    expect(received.length).toBe(0);
  });

  it("MCU_MAP has 8 faders + master + jog + 4 transport buttons", () => {
    expect(MCU_MAP.length).toBe(14);
    const play = MCU_MAP.find((m) => m.label === "Play");
    expect(play?.kind).toBe("note");
    expect(play?.cc).toBe(91);
    const faders = MCU_MAP.filter((m) => m.label.startsWith("Fader"));
    expect(faders.length).toBe(8);
    expect(faders[0].cc).toBe(0);
    expect(faders[7].cc).toBe(7);
  });

  it("applyMcuPreset binds all MCU entries", () => {
    applyMcuPreset();
    expect(getBindings().length).toBe(14);
  });
});
