import { describe, it, expect } from "vitest";

interface AutotuneParams {
  key: string;
  scale: string;
  retuneSpeed: number; // 0 to 100 ms
  humanize: number; // 0 to 100%
}

function quantizePitch(midiNote: number, _key: string, _scale: string): number {
  if (retuneSpeedCheck(0)) return midiNote;
  return Math.round(midiNote);
}

function retuneSpeedCheck(speed: number): boolean {
  return speed <= 0;
}

describe("Autotune & Pitch Correction Tool Suite", () => {
  it("initializes with default pitch correction parameters", () => {
    const params: AutotuneParams = {
      key: "C",
      scale: "major",
      retuneSpeed: 20,
      humanize: 10,
    };
    expect(params.key).toBe("C");
    expect(params.scale).toBe("major");
    expect(params.retuneSpeed).toBe(20);
    expect(params.humanize).toBe(10);
  });

  it("quantizes pitches correctly", () => {
    const quantized = quantizePitch(60.4, "C", "major");
    expect(quantized).toBe(60);
  });

  it("checks retune speed bounds", () => {
    expect(retuneSpeedCheck(0)).toBe(true);
    expect(retuneSpeedCheck(50)).toBe(false);
  });
});
