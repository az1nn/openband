import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrackDef } from "../src/lib/types";

const renderTrackStem = vi.fn();
const getProjectDurationSeconds = vi.fn();
const applyPluginChain = vi.fn(async (buffer: globalThis.AudioBuffer) => buffer);

vi.mock("../src/lib/midiSynth", () => ({
  renderTrackStem,
  getProjectDurationSeconds,
}));
vi.mock("../src/lib/pluginChain", () => ({ applyPluginChain }));

function makeBuffer(leftValues: number[], rightValues = leftValues, sampleRate = 44100): globalThis.AudioBuffer {
  const left = new Float32Array(leftValues);
  const right = new Float32Array(rightValues);
  return {
    numberOfChannels: 2,
    length: left.length,
    sampleRate,
    duration: left.length / sampleRate,
    getChannelData: (channel: number) => (channel === 0 ? left : right),
  } as globalThis.AudioBuffer;
}

class BufferFactoryContext {
  destination = {};
  constructor(_channels: number, _length: number, _sampleRate: number) {}
  createBuffer(channels: number, length: number, sampleRate: number) {
    const data = Array.from({ length: channels }, () => new Float32Array(length));
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: (channel: number) => data[channel],
    } as globalThis.AudioBuffer;
  }
  close() { return Promise.resolve(); }
}
vi.stubGlobal("OfflineAudioContext", BufferFactoryContext as unknown as typeof OfflineAudioContext);

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

async function pcmPeak(blob: Blob): Promise<number> {
  const bytes = await blob.arrayBuffer();
  const view = new DataView(bytes);
  let offset = 12;
  while (offset + 8 <= view.byteLength) {
    const id = String.fromCharCode(
      view.getUint8(offset), view.getUint8(offset + 1),
      view.getUint8(offset + 2), view.getUint8(offset + 3),
    );
    const size = view.getUint32(offset + 4, true);
    if (id === "data") {
      let peak = 0;
      for (let p = offset + 8; p + 1 < Math.min(view.byteLength, offset + 8 + size); p += 2) {
        peak = Math.max(peak, Math.abs(view.getInt16(p, true) / 32768));
      }
      return peak;
    }
    offset += 8 + size + (size % 2);
  }
  return 0;
}

describe("export trust", () => {
  beforeEach(() => {
    renderTrackStem.mockReset();
    getProjectDurationSeconds.mockReset();
    applyPluginChain.mockClear();
    getProjectDurationSeconds.mockReturnValue(4 / 44100);
    renderTrackStem.mockResolvedValue(makeBuffer([0.5, 0.25, -0.5, -0.25], [0.1, 0.05, -0.1, -0.05]));
  });

  it("snapshots render input without later UI mutation", async () => {
    const { createExportSnapshot } = await import("../src/lib/exportTrust");
    const source = track({ volume: 65, midiNotes: [{ pitch: 60, start: 0, duration: 1, velocity: 100 }] });
    const snapshot = createExportSnapshot({ tracks: [source], bpm: 120 });
    source.volume = 5;
    source.midiNotes![0].pitch = 72;
    expect(snapshot.tracks[0].volume).toBe(65);
    expect(snapshot.tracks[0].midiNotes![0].pitch).toBe(60);
  });

  it("honors mute/solo and forwards percentage volume/pan to strict stem rendering", async () => {
    const { renderProjectWav } = await import("../src/lib/exportTrust");
    const solo = track({ id: "solo", solo: true, volume: 42, pan: -75, midiNotes: [{ pitch: 60, start: 0, duration: 1, velocity: 100 }] });
    const other = track({ id: "other", volume: 90, pan: 80, midiNotes: [{ pitch: 64, start: 0, duration: 1, velocity: 100 }] });
    const result = await renderProjectWav({ tracks: [solo, other], bpm: 120 });
    expect(renderTrackStem).toHaveBeenCalledTimes(1);
    expect(renderTrackStem).toHaveBeenCalledWith(
      expect.objectContaining({ id: "solo", volume: 42, pan: -75 }),
      120,
      expect.any(Number),
      [],
      { strict: true },
    );
    expect(await pcmPeak(result.blob)).toBeGreaterThan(0.1);
  });

  it("applies bus routing gain without destroying stereo pan energy", async () => {
    const { mixRenderedStems } = await import("../src/lib/exportTrust");
    const source = track({ outputId: "bus-a", sends: {} });
    const mixed = mixRenderedStems(
      [{ track: source, buffer: makeBuffer([0.8, 0.8], [0.2, 0.2]) }],
      [{ id: "bus-a", name: "Bus A", color: "#fff", volume: 0.5, muted: false, plugins: [] }],
      2,
      44100,
    );
    expect(mixed.getChannelData(0)[0]).toBeCloseTo(0.4, 5);
    expect(mixed.getChannelData(1)[0]).toBeCloseTo(0.1, 5);
  });

  it("produces a non-empty decodable RIFF/WAVE with audible deterministic PCM", async () => {
    const { renderProjectWav, validateWavBlob } = await import("../src/lib/exportTrust");
    const result = await renderProjectWav({
      tracks: [track({ midiNotes: [{ pitch: 60, start: 0, duration: 1, velocity: 100 }] })],
      bpm: 120,
    });
    await expect(validateWavBlob(result.blob)).resolves.toBeUndefined();
    expect(result.blob.type).toBe("audio/wav");
    expect(result.blob.size).toBeGreaterThan(44);
    expect(await pcmPeak(result.blob)).toBeGreaterThan(0.1);
  });

  it("runs the active master-rack chain and propagates master failures", async () => {
    const { renderProjectWav, ExportTrustError } = await import("../src/lib/exportTrust");
    const master = [{ id: "m1", name: "Limiter", type: "limiter" as const, enabled: true, params: {} }];
    await renderProjectWav({
      tracks: [track({ midiNotes: [{ pitch: 60, start: 0, duration: 1, velocity: 100 }] })],
      bpm: 120,
      masterPlugins: master,
    });
    expect(applyPluginChain).toHaveBeenCalledWith(expect.anything(), master, 44100, expect.any(Object));

    applyPluginChain.mockRejectedValueOnce(new Error("master exploded"));
    await expect(renderProjectWav({
      tracks: [track({ midiNotes: [{ pitch: 60, start: 0, duration: 1, velocity: 100 }] })],
      bpm: 120,
      masterPlugins: master,
    })).rejects.toMatchObject({ name: ExportTrustError.name, code: "MASTER_RENDER_FAILED" });
  });

  it("fails explicitly and leaves the caller snapshot untouched when a required track cannot render", async () => {
    const { renderProjectWav } = await import("../src/lib/exportTrust");
    const source = track({ regions: [{ id: "r1", start: 0, duration: 1, url: "asset://missing" }] });
    const before = JSON.stringify(source);
    renderTrackStem.mockRejectedValueOnce(new Error("missing durable asset"));
    await expect(renderProjectWav({ tracks: [source], bpm: 120 })).rejects.toMatchObject({ code: "TRACK_RENDER_FAILED" });
    expect(JSON.stringify(source)).toBe(before);
  });

  it("does not fabricate a header-only success for an empty project", async () => {
    const { renderProjectWav } = await import("../src/lib/exportTrust");
    getProjectDurationSeconds.mockReturnValueOnce(0);
    await expect(renderProjectWav({ tracks: [], bpm: 120 })).rejects.toMatchObject({ code: "NO_RENDERABLE_CONTENT" });
  });
});
