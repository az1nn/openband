import { describe, it, expect } from "vitest";
import { analyzeStemSpectrum } from "../src/lib/aiStemMastering";

describe("AI Stem Mastering & Dynamic EQ Analyzer Suite", () => {
  it("analyzes stem spectrum and suggests EQ adjustments", () => {
    const dummyBuffer = new Float32Array([0.1, 0.2, 0.4, 0.2, 0.1]);
    const result = analyzeStemSpectrum("Bass", dummyBuffer);
    expect(result.stemName).toBe("Bass");
    expect(result.maskingCollisionScore).toBeGreaterThanOrEqual(0);
    expect(result.suggestedEQ.length).toBeGreaterThan(0);
  });
});
