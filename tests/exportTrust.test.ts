import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrackDef } from "../src/lib/types";

const renderTracksToWavBlob = vi.fn();
const getProjectDurationSeconds = vi.fn();

class MockFullProjectRenderError extends Error {
  constructor(
    public readonly stage: "source" | "track-effect" | "master-effect" | "offline",
    message: string,
  ) {
    super(message);
    this.name = "FullProjectRenderError";
  }
}

vi.mock("../src/lib/midiSynth", () => ({
  FullProjectRenderError: MockFullProjectRenderError,
  renderTracksToWavBlob,
  getProjectDurationSeconds,
}));

function track(overrides: Partial<TrackDef> = {}): TrackDef {
  return {
    id: overrides.id ?? "t1",
    name: overrides.name ?? "Track 1",
    color: overrides.color ?? "#fff",
    muted: overrides.muted ?? false,
    solo: overrides.solo ?? false,
    volume: overrides.volume ?? 100,
    pan: overrides.pan ?? 0,
    sends: overrides.sends ?? {},
    regions: overrides.regions ?? [],
    midiNotes: overrides.midiNotes,
    sidechainSource: overrides.sidechainSource ?? null,
    plugins: overrides.plugins ?? [],
    automation: overrides.automation ?? {},
    outputId: overrides.outputId,
  };
}

function validWavBlob(samples = [0.5, -0.5, 0.25, -0.25]): Blob {
  const dataSize = samples.length * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const write = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 44100, true);
  view.setUint32(28, 88200, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, dataSize, true);
  samples.forEach((sample, index) => {
    view.setInt16(44 + index * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true);
  });
  return new Blob([ab], { type: "audio/wav" });
}

describe("export trust boundary", () => {
  beforeEach(() => {
    renderTracksToWavBlob.mockReset();
    getProjectDurationSeconds.mockReset();
    getProjectDurationSeconds.mockReturnValue(1);
    renderTracksToWavBlob.mockResolvedValue(validWavBlob());
  });

  it("snapshots render input without later UI mutation", async () => {
    const { createExportSnapshot } = await import("../src/lib/exportTrust");
    const source = track({
      volume: 65,
      midiNotes: [{ pitch: 60, start: 0, duration: 1, velocity: 100 }],
    });
    const snapshot = createExportSnapshot({ tracks: [source], bpm: 120 });
    source.volume = 5;
    source.midiNotes![0].pitch = 72;
    expect(snapshot.tracks[0].volume).toBe(65);
    expect(snapshot.tracks[0].midiNotes![0].pitch).toBe(60);
  });

  it("passes the complete immutable project snapshot to strict full-project rendering", async () => {
    const { renderProjectWav } = await import("../src/lib/exportTrust");
    const plugin = { id: "p1", name: "EQ", type: "eq" as const, enabled: true, params: {} };
    const source = track({
      volume: 42,
      pan: -75,
      plugins: [plugin],
      midiNotes: [{ pitch: 60, start: 0, duration: 1, velocity: 100 }],
    });
    const master = [{ id: "m1", name: "Limiter", type: "limiter" as const, enabled: true, params: {} }];
    const buses = [{ id: "b1", name: "Bus", color: "#fff", volume: 0.8, muted: false, plugins: [] }];
    await renderProjectWav({ tracks: [source], bpm: 128, buses, masterPlugins: master });
    expect(renderTracksToWavBlob).toHaveBeenCalledWith(
      [expect.objectContaining({ id: "t1", volume: 42, pan: -75, plugins: [plugin] })],
      128,
      undefined,
      buses,
      master,
      { strict: true, normalizeMixerUnits: true },
    );
  });

  it("rejects a mute/solo state with no audible renderable content", async () => {
    const { renderProjectWav } = await import("../src/lib/exportTrust");
    await expect(renderProjectWav({
      tracks: [track({ muted: true, regions: [{ id: "r", start: 0, duration: 1, url: "asset://x" }] })],
      bpm: 120,
    })).rejects.toMatchObject({ code: "NO_RENDERABLE_CONTENT" });
    expect(renderTracksToWavBlob).not.toHaveBeenCalled();
  });

  it("accepts a structurally valid non-empty RIFF/WAVE result", async () => {
    const { renderProjectWav, validateWavBlob } = await import("../src/lib/exportTrust");
    const result = await renderProjectWav({
      tracks: [track({ midiNotes: [{ pitch: 60, start: 0, duration: 1, velocity: 100 }] })],
      bpm: 120,
    });
    await expect(validateWavBlob(result.blob)).resolves.toBeUndefined();
    expect(result.blob.type).toBe("audio/wav");
    expect(result.blob.size).toBeGreaterThan(44);
  });

  it("maps strict source and master failures to explicit export errors", async () => {
    const { renderProjectWav } = await import("../src/lib/exportTrust");
    const input = {
      tracks: [track({ regions: [{ id: "r", start: 0, duration: 1, url: "asset://missing" }] })],
      bpm: 120,
    };
    renderTracksToWavBlob.mockRejectedValueOnce(new MockFullProjectRenderError("source", "missing asset"));
    await expect(renderProjectWav(input)).rejects.toMatchObject({ code: "TRACK_RENDER_FAILED" });

    renderTracksToWavBlob.mockRejectedValueOnce(new MockFullProjectRenderError("master-effect", "master failed"));
    await expect(renderProjectWav(input)).rejects.toMatchObject({ code: "MASTER_RENDER_FAILED" });
  });

  it("leaves caller project state untouched when rendering fails", async () => {
    const { renderProjectWav } = await import("../src/lib/exportTrust");
    const source = track({ regions: [{ id: "r", start: 0, duration: 1, url: "asset://missing" }] });
    const before = JSON.stringify(source);
    renderTracksToWavBlob.mockRejectedValueOnce(new MockFullProjectRenderError("offline", "render failed"));
    await expect(renderProjectWav({ tracks: [source], bpm: 120 })).rejects.toMatchObject({ code: "PROJECT_RENDER_FAILED" });
    expect(JSON.stringify(source)).toBe(before);
  });

  it("does not fabricate success for an empty project or invalid WAV", async () => {
    const { renderProjectWav, validateWavBlob } = await import("../src/lib/exportTrust");
    getProjectDurationSeconds.mockReturnValueOnce(0);
    await expect(renderProjectWav({ tracks: [], bpm: 120 })).rejects.toMatchObject({ code: "NO_RENDERABLE_CONTENT" });
    await expect(validateWavBlob(new Blob([new Uint8Array(44)], { type: "audio/wav" }))).rejects.toMatchObject({ code: "INVALID_WAV" });
  });
});
