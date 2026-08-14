import { describe, it, expect } from "vitest";
import { serializeToDawprojectXml } from "../src/lib/dawprojectExport";

describe("Open-Standard .dawproject Export Suite", () => {
  it("serializes project state into standard dawproject XML format", () => {
    const xml = serializeToDawprojectXml({
      title: "My Jam",
      bpm: 120,
      timeSignature: "4/4",
      tracks: [{ name: "Drums", volume: 90 }],
    });
    expect(xml).toContain("My Jam");
    expect(xml).toContain("Drums");
    expect(xml).toContain("DAWProject");
  });
});
