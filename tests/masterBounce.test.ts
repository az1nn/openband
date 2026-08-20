import { describe, it, expect } from "vitest";
import { composeBounceResult } from "../backend/src/routes/master";

describe("master bounce H5 mastering chain not silently applied", () => {
  const base = {
    userId: "u1",
    outputFilename: "master_u1_123.wav",
    format: "wav",
    bitDepth: 16,
    sampleRate: 44100,
    size: 2048,
    pluginStates: [{ type: "limiter", enabled: true }],
  };

  it("marks the chain as not applied and warns", () => {
    const r = composeBounceResult(base);
    expect(r.applied).toBe(false);
    expect(typeof r.warning).toBe("string");
    expect(r.warning.length).toBeGreaterThan(0);
  });

  it("still returns the passthrough file metadata and a valid download url", () => {
    const r = composeBounceResult(base);
    expect(r.filename).toBe(base.outputFilename);
    expect(r.url).toBe(`/api/master/download/${base.outputFilename}`);
    expect(r.format).toBe("wav");
    expect(r.size).toBe(2048);
  });

  it("echoes pluginStates without applying them", () => {
    const r = composeBounceResult(base);
    expect(r.pluginStates).toEqual(base.pluginStates);
  });
});
