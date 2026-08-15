import { describe, it, expect } from "vitest";
import {
  hzToMidi,
  midiToHz,
  CHROMATIC,
  quantizeToScale,
} from "../src/lib/autotune";

const MAJOR = [0, 2, 4, 5, 7, 9, 11];

describe("autotune pure math", () => {
  it("hzToMidi and midiToHz round-trip", () => {
    expect(hzToMidi(440)).toBeCloseTo(69, 5);
    expect(midiToHz(69)).toBeCloseTo(440, 5);
    expect(midiToHz(60)).toBeCloseTo(261.6256, 3);
    expect(hzToMidi(261.63)).toBeCloseTo(60, 2);
  });

  it("CHROMATIC contains all twelve pitch classes", () => {
    expect(CHROMATIC).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("chromatic scale leaves every pitch unchanged", () => {
    for (const hz of [220, 261.63, 311.13, 466.16, 523.25]) {
      expect(quantizeToScale(hz, 0, CHROMATIC)).toBe(hz);
    }
  });

  it("major scale snaps an off-note to the nearest scale degree", () => {
    const eb = 311.13;
    const target = quantizeToScale(eb, 0, MAJOR);
    const targetMidi = Math.round(hzToMidi(target));
    const pc = ((targetMidi % 12) + 12) % 12;
    expect(MAJOR.map((i) => (i % 12))).toContain(pc);
    expect(target).not.toBe(eb);
  });

  it("respects a root other than C", () => {
    const a = 466.16;
    const target = quantizeToScale(a, 9, MAJOR);
    const targetMidi = Math.round(hzToMidi(target));
    const pc = ((targetMidi % 12) + 12) % 12;
    const expected = new Set(MAJOR.map((i) => ((9 + i) % 12 + 12) % 12));
    expect(expected.has(pc)).toBe(true);
  });

  it("leaves within-tolerance pitches unchanged", () => {
    const c4 = 261.63;
    const slightlyOff = c4 * Math.pow(2, 5 / 1200);
    expect(quantizeToScale(slightlyOff, 0, MAJOR, 20)).toBe(slightlyOff);
  });

  it("zero or negative hz returns input unchanged", () => {
    expect(quantizeToScale(0, 0, MAJOR)).toBe(0);
    expect(quantizeToScale(-50, 0, MAJOR)).toBe(-50);
  });
});
