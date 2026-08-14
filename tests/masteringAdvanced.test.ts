import { describe, it, expect } from "vitest";
import {
  MASTERING_CHAIN_PRESETS,
  buildMasteringChain,
  validateMasteringChain,
} from "../src/lib/mastering";

describe("Advanced Mastering Suite Tests", () => {
  it("contains valid presets with expected names and plugins", () => {
    expect(MASTERING_CHAIN_PRESETS.length).toBeGreaterThan(0);
    for (const preset of MASTERING_CHAIN_PRESETS) {
      expect(preset.name).toBeTruthy();
      expect(Array.isArray(preset.plugins)).toBe(true);
      expect(validateMasteringChain(preset.plugins)).toBe(true);
    }
  });

  it("builds mastering chain from preset plugins", () => {
    const preset = MASTERING_CHAIN_PRESETS[0];
    const chain = buildMasteringChain(preset.plugins);
    expect(chain).toBeDefined();
  });

  it("validates empty and malformed mastering chains correctly", () => {
    expect(validateMasteringChain([])).toBe(true);
    expect(validateMasteringChain([{ id: "p1", type: "eq", enabled: true, params: {} }] as any)).toBe(true);
    expect(validateMasteringChain(null as any)).toBe(false);
  });
});
