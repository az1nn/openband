import { beforeEach, describe, expect, it } from "vitest";
import { Platform } from "react-native";
import {
  resolveRegionSourceWindow,
  splitRegion,
  trimRegion,
} from "../src/lib/regionEdit";
import { exportProject, importProject, loadProject, saveProject } from "../src/lib/projectStore";

describe("source-aware region semantics", () => {
  it("preserves legacy defaults and clamps to decoded source bounds", () => {
    expect(resolveRegionSourceWindow({ duration: 3 })).toEqual({ offset: 0, length: 3 });
    expect(resolveRegionSourceWindow({ duration: 3, offset: 8, length: 4 }, 10)).toEqual({
      offset: 8,
      length: 2,
    });
  });

  it("partitions a non-zero source window on split", () => {
    const [left, right] = splitRegion(
      { id: "r", start: 4, duration: 6, offset: 2, length: 6, url: "asset://tone" },
      6,
    );
    expect(left).toMatchObject({ start: 4, duration: 2, offset: 2, length: 2 });
    expect(right).toMatchObject({ start: 6, duration: 4, offset: 4, length: 4 });
  });

  it("advances source offset on start trim and preserves it on end trim", () => {
    const base = { id: "r", start: 4, duration: 6, offset: 2, length: 6 };
    expect(trimRegion(base, "start", 1.5, 12)).toMatchObject({
      start: 5.5,
      duration: 4.5,
      offset: 3.5,
      length: 4.5,
    });
    expect(trimRegion(base, "end", -1.5, 12)).toMatchObject({
      start: 4,
      duration: 4.5,
      offset: 2,
      length: 4.5,
    });
  });
});

describe("source-window persistence", () => {
  beforeEach(() => {
    (Platform as any).OS = "web";
    window.localStorage.clear();
  });

  it("retains offset/length and asset identity through save/load and JSON export/import", () => {
    const region = {
      id: "r1",
      start: 1,
      duration: 1.25,
      offset: 2.5,
      length: 1.25,
      url: "asset://source-aware-fixture",
    };
    const project: any = {
      title: "Source Window",
      genre: "",
      key: "C",
      bpm: 120,
      tracks: [{
        id: "t1", name: "Audio", color: "#fff", muted: false, solo: false,
        volume: 100, pan: 0, sends: {}, regions: [region], sidechainSource: null,
        plugins: [], automation: {},
      }],
      groups: [], buses: [], trackAssignments: {}, masterPlugins: [], masteringChain: [],
      sendBuses: [], trackAmpChains: {}, mixSnapshots: [], activeMixId: undefined,
      metronome: { bpm: 120, timeSig: [4, 4], accentInterval: 4, volume: 0.5, enabled: false, countIn: false, countInBars: 2 },
      recordSettings: { armed: false, inputSource: "mic", quality: "high", sampleRate: 44100, mono: false, preRoll: 0 },
    };

    expect(saveProject("source-window", project)).toBe(true);
    expect(loadProject("source-window")?.tracks[0].regions[0]).toMatchObject(region);

    const exported = exportProject("source-window");
    expect(exported).toBeTruthy();
    window.localStorage.clear();
    expect(importProject(exported!)).toBe("source-window");
    expect(loadProject("source-window")?.tracks[0].regions[0]).toMatchObject(region);
  });
});
