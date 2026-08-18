import { describe, it, expect } from "vitest";
import {
  analyzeBuffer,
  generateAutoMix,
  type StemAnalysis,
} from "../src/lib/aiAutoMixAnalysis";

function fakeBuffer(): AudioBuffer {
  const data = new Float32Array(44100);
  return {
    numberOfChannels: 1,
    length: 44100,
    sampleRate: 44100,
    duration: 1,
    getChannelData: () => data,
    getChannelDataFromInput: () => data,
  } as unknown as AudioBuffer;
}

function roleOf(name: string): StemAnalysis["role"] {
  return analyzeBuffer(fakeBuffer(), "t1", name).role;
}

describe("regression-round2-ui: aiAutoMixAnalysis role precedence", () => {
  it("detectRole kick explicit => kick", () => {
    expect(roleOf("kick")).toBe("kick");
  });

  it("detectRole drum alone => NOT kick (falls through to spectral heuristics)", () => {
    expect(roleOf("drum")).not.toBe("kick");
  });

  it("detectRole drum low => kick (parenthesized && precedence)", () => {
    expect(roleOf("drum low")).toBe("kick");
  });
});

describe("regression-round2-ui: aiAutoMixAnalysis empty aggregate safe default", () => {
  it("generateAutoMix([]) returns finite master LUFS and peak (no NaN / -Infinity)", () => {
    const result = generateAutoMix([]);
    expect(result.suggestions).toEqual([]);
    expect(Number.isFinite(result.masterSuggestion.targetLufs)).toBe(true);
    expect(Number.isFinite(result.masterSuggestion.targetPeak)).toBe(true);
    expect(result.masterSuggestion.targetLufs).not.toBeNaN();
    expect(result.masterSuggestion.targetPeak).not.toBe(-Infinity);
  });
});
