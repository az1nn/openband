import { describe, expect, it } from "vitest";
import type { TrackDef } from "../src/lib/types";
import {
  deleteRegion,
  duplicateRegion,
  moveRegionBySeconds,
  repeatRegion,
} from "../src/lib/creativeLoop";

const baseTrack: TrackDef = {
  id: "track-1",
  name: "Audio",
  color: "bg-blue-500",
  muted: false,
  solo: false,
  volume: 80,
  pan: 0,
  sends: {},
  sidechainSource: null,
  regions: [
    { id: "r1", start: 2, duration: 4, url: "asset://take.wav" },
  ],
  plugins: [],
  automation: {},
};

function tracks(): TrackDef[] {
  return [{ ...baseTrack, regions: baseTrack.regions.map((region) => ({ ...region })) }];
}

describe("creative loop region actions", () => {
  it("moves a region and clamps it at zero without changing its source", () => {
    const moved = moveRegionBySeconds(tracks(), "track-1", "r1", -10);
    expect(moved[0].regions[0]).toMatchObject({
      id: "r1",
      start: 0,
      duration: 4,
      url: "asset://take.wav",
    });
  });

  it("duplicates immediately after the selected region", () => {
    const duplicated = duplicateRegion(tracks(), "track-1", "r1", "r2");
    expect(duplicated[0].regions).toHaveLength(2);
    expect(duplicated[0].regions[1]).toMatchObject({
      id: "r2",
      start: 6,
      duration: 4,
      url: "asset://take.wav",
    });
  });

  it("repeats a region consecutively", () => {
    const repeated = repeatRegion(tracks(), "track-1", "r1", ["r2", "r3", "r4"]);
    expect(repeated[0].regions.map((region) => region.start)).toEqual([2, 6, 10, 14]);
    expect(repeated[0].regions.every((region) => region.url === "asset://take.wav")).toBe(true);
  });

  it("deletes only the selected region", () => {
    const deleted = deleteRegion(tracks(), "track-1", "r1");
    expect(deleted[0].regions).toEqual([]);
  });
});
