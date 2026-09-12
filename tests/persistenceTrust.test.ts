import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeIndexedDb } from "./helpers/fakeIndexedDb";

const project = {
  title: "Persistence",
  genre: "rock",
  key: "E",
  bpm: 120,
  tracks: [],
  groups: [],
  buses: [],
  trackAssignments: {},
  masterPlugins: [],
  masteringChain: [],
  sendBuses: [],
  trackAmpChains: {},
  mixSnapshots: [],
  activeMixId: undefined,
  metronome: { bpm: 120, timeSig: [4, 4] as [number, number], accentInterval: 4, volume: 0.5, enabled: false, countIn: false, countInBars: 2 },
  recordSettings: { armed: false, inputSource: "mic" as const, quality: "high" as const, sampleRate: 44100 as const, mono: false, preRoll: 0 },
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("persistence trust", () => {
  it("rebuilds a missing project index from valid project payloads", async () => {
    const { saveProject, listProjectIndex } = await import("../src/lib/projectStore");
    expect(saveProject("p1", project)).toBe(true);
    localStorage.removeItem("openband_project_index");
    expect(listProjectIndex().p1.title).toBe("Persistence");
    expect(JSON.parse(localStorage.getItem("openband_project_index") || "{}").p1.title).toBe("Persistence");
  });

  it("rebuilds a corrupt project index without dropping valid projects", async () => {
    const { saveProject, listProjectIndex } = await import("../src/lib/projectStore");
    expect(saveProject("p1", project)).toBe(true);
    localStorage.setItem("openband_project_index", "{broken");
    expect(listProjectIndex().p1.title).toBe("Persistence");
  });

  it("rolls back the project payload when the index write fails", async () => {
    const { saveProject, loadProject } = await import("../src/lib/projectStore");
    expect(saveProject("p1", project)).toBe(true);
    const previous = localStorage.getItem("openband_project_p1");
    const nativeSet = Storage.prototype.setItem;
    let failed = false;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === "openband_project_index" && !failed) {
        failed = true;
        throw new Error("quota");
      }
      return nativeSet.call(this, key, value);
    });
    expect(saveProject("p1", { ...project, title: "Should rollback" })).toBe(false);
    expect(localStorage.getItem("openband_project_p1")).toBe(previous);
    expect(loadProject("p1")?.title).toBe("Persistence");
  });

  it("reports storage read failure without throwing or mutating the durable project", async () => {
    const { saveProject } = await import("../src/lib/projectStore");
    expect(saveProject("p1", project)).toBe(true);
    const nativeGet = Storage.prototype.getItem;
    const previous = nativeGet.call(localStorage, "openband_project_p1");

    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, key: string) {
      if (key === "openband_project_p1") {
        throw new DOMException("Storage access denied", "SecurityError");
      }
      return nativeGet.call(this, key);
    });

    let result = true;
    expect(() => {
      result = saveProject("p1", { ...project, title: "Must not persist" });
    }).not.toThrow();
    expect(result).toBe(false);
    expect(nativeGet.call(localStorage, "openband_project_p1")).toBe(previous);
  });

  it("preserves durable asset pointers through JSON export/import recovery", async () => {
    const { saveProject, exportProject, importProject, loadProject, deleteProject } = await import(
      "../src/lib/projectStore"
    );
    const id = "p-asset-json";
    const withAsset = {
      ...project,
      tracks: [
        {
          id: "t1",
          name: "Audio",
          volume: 75,
          pan: 0,
          muted: false,
          solo: false,
          sends: {},
          sidechainSource: null,
          regions: [{ id: "r1", start: 0, duration: 1, url: "asset://existing" }],
          plugins: [],
          automation: {},
        },
      ],
    };
    expect(saveProject(id, withAsset as any)).toBe(true);
    const json = exportProject(id);
    expect(json).toContain("asset://existing");

    deleteProject(id);
    expect(importProject(json!)).toBe(id);
    expect(loadProject(id)?.tracks[0].regions[0].url).toBe("asset://existing");
  });

  it("keeps persisted asset bytes resolvable after a module-session reset", async () => {
    const idb = createFakeIndexedDb();
    vi.stubGlobal("indexedDB", idb.indexedDB);
    const urlCtor = globalThis.URL as typeof URL & {
      createObjectURL?: (blob: Blob) => string;
      revokeObjectURL?: (url: string) => void;
    };
    Object.defineProperty(urlCtor, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:resolved"),
    });
    Object.defineProperty(urlCtor, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
    const first = await import("../src/lib/assetStore");
    const pointer = await first.saveAsset(new Blob([new Uint8Array([7, 8, 9])], { type: "audio/wav" }));
    first.revokeAssetCache();
    vi.resetModules();
    const second = await import("../src/lib/assetStore");
    await expect(second.resolveAssetUrl(pointer)).resolves.toBe("blob:resolved");
  });
});
