import { describe, expect, it, vi } from "vitest";
import {
  persistImportedAudioFiles,
  resolvePersistedTrackAssets,
} from "../app/studio/persistenceTrust";

function audioFile(name: string, size = 60000) {
  const blob = new Blob([new Uint8Array(size)], { type: "audio/wav" });
  return Object.assign(blob, { name });
}

describe("Studio persisted audio integration", () => {
  it("adds an imported track only after durable asset persistence resolves", async () => {
    let resolveWrite!: (value: string) => void;
    const persistAsset = vi.fn(
      () => new Promise<string>((resolve) => { resolveWrite = resolve; }),
    );
    let settled = false;
    const pending = persistImportedAudioFiles({
      files: [audioFile("take.wav")],
      existingTrackCount: 0,
      trackColors: ["#fff"],
      persistAsset,
    }).then((value) => {
      settled = true;
      return value;
    });

    await Promise.resolve();
    expect(settled).toBe(false);
    resolveWrite("asset://take");
    const result = await pending;
    expect(result.failedNames).toEqual([]);
    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].regions[0].url).toBe("asset://take");
  });

  it("does not create project state for files whose durable write fails", async () => {
    const persistAsset = vi
      .fn()
      .mockResolvedValueOnce("asset://good")
      .mockRejectedValueOnce(new Error("quota"));
    const result = await persistImportedAudioFiles({
      files: [audioFile("good.wav"), audioFile("bad.wav")],
      existingTrackCount: 2,
      trackColors: ["#a", "#b"],
      persistAsset,
    });
    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].regions[0].url).toBe("asset://good");
    expect(result.failedNames).toEqual(["bad.wav"]);
  });

  it("reports unique missing persisted pointers without changing project structure", async () => {
    const tracks = [
      {
        id: "t1",
        regions: [
          { id: "r1", start: 0, duration: 1, url: "asset://missing" },
          { id: "r2", start: 1, duration: 1, url: "asset://missing" },
          { id: "r3", start: 2, duration: 1, url: "asset://ok" },
        ],
      },
    ] as any;
    const resolve = vi.fn(async (url: string) => {
      if (url === "asset://missing") throw new Error("missing");
      return "blob:ok";
    });
    const before = JSON.stringify(tracks);
    await expect(resolvePersistedTrackAssets(tracks, resolve)).resolves.toEqual([
      "asset://missing",
    ]);
    expect(JSON.stringify(tracks)).toBe(before);
    expect(resolve).toHaveBeenCalledTimes(2);
  });
});
