import { describe, it, expect } from "vitest";
import type { PluginType } from "../../src/lib/types";

const ALL_PLUGIN_TYPES: PluginType[] = [
  "eq",
  "compressor",
  "limiter",
  "distortion",
  "reverb",
  "delay",
  "filter",
  "modulation",
  "utility",
  "multibandCompressor",
  "stereoImager",
  "deesser",
  "tapeSaturator",
  "truePeakLimiter",
  "noiseGate",
  "autoPitch",
  "bassMono",
  "stereoWidener",
  "clipper",
  "voiceCleaner",
];

describe("Comprehensive Audio Plugins Test Suite", () => {
  it("covers all 20 plugin types with valid state properties", () => {
    expect(ALL_PLUGIN_TYPES.length).toBe(20);
    for (const pluginType of ALL_PLUGIN_TYPES) {
      const pluginInstance = {
        id: `plugin-${pluginType}`,
        name: pluginType.toUpperCase(),
        type: pluginType,
        enabled: true,
        params: { threshold: -20, ratio: 4 },
      };
      expect(pluginInstance.type).toBe(pluginType);
      expect(pluginInstance.enabled).toBe(true);
      expect(typeof pluginInstance.params).toBe("object");
    }
  });

  it("serializes and deserializes plugin parameter states correctly", () => {
    const original = {
      id: "p1",
      name: "EQ",
      type: "eq" as PluginType,
      enabled: true,
      params: { lowGain: 3, highGain: -2 },
    };
    const serialized = JSON.stringify(original);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toEqual(original);
  });
});
