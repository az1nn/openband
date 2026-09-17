import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Platform } from "react-native";

const startCalls: number[][] = [];

function param(value = 0) {
  return {
    value,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
}

class SourceWindowOfflineContext {
  destination = {};
  sampleRate: number;
  length: number;
  numberOfChannels: number;

  constructor(channels: number, length: number, sampleRate: number) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
  }
  createGain() { return { gain: param(1), connect: vi.fn(), disconnect: vi.fn() }; }
  createStereoPanner() { return { pan: param(0), connect: vi.fn(), disconnect: vi.fn() }; }
  createBiquadFilter() { return { type: "lowpass", frequency: param(1000), Q: param(0), connect: vi.fn() }; }
  createConvolver() { return { buffer: null, connect: vi.fn() }; }
  createBufferSource() {
    return {
      buffer: null as AudioBuffer | null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn((...args: number[]) => startCalls.push(args)),
      stop: vi.fn(),
    };
  }
  createBuffer(channels: number, length: number, sampleRate: number): AudioBuffer {
    const data = Array.from({ length: channels }, () => new Float32Array(length));
    return {
      numberOfChannels: channels, length, sampleRate, duration: length / sampleRate,
      getChannelData: (ch: number) => data[ch],
    } as AudioBuffer;
  }
  async decodeAudioData(_ab: ArrayBuffer): Promise<AudioBuffer> {
    return this.createBuffer(1, this.sampleRate * 4, this.sampleRate);
  }
  async startRendering(): Promise<AudioBuffer> {
    return this.createBuffer(this.numberOfChannels, this.length, this.sampleRate);
  }
}

function makeSegmentedWav(sampleRate = 8): ArrayBuffer {
  const samples = new Int16Array(sampleRate);
  for (let i = 0; i < samples.length; i++) samples[i] = i < sampleRate / 2 ? 8192 : -24576;
  const ab = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(ab);
  const text = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  text(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); text(8, "WAVE");
  text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * 2, samples[i], true);
  return ab;
}

function readSigned24(view: DataView, offset: number): number {
  const raw = view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16);
  return raw & 0x800000 ? raw | ~0xffffff : raw;
}

describe("source-aware renderers", () => {
  const originalOS = Platform.OS;
  beforeEach(() => {
    startCalls.length = 0;
    vi.stubGlobal("OfflineAudioContext", SourceWindowOfflineContext as any);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(16) }));
  });
  afterEach(() => {
    (Platform as any).OS = originalOS;
    vi.unstubAllGlobals();
  });

  it("strict full-project renderer schedules the selected source window", async () => {
    (Platform as any).OS = "web";
    const { renderTracksToWavBlob } = await import("../src/lib/midiSynth");
    const track: any = {
      id: "t1", name: "Audio", color: "#fff", muted: false, solo: false, volume: 100, pan: 0,
      sends: {}, sidechainSource: null, plugins: [], automation: {},
      regions: [{ id: "r1", start: 1, duration: 1, offset: 2, length: 1, url: "blob:fixture" }],
    };
    const blob = await renderTracksToWavBlob([track], 120, undefined, undefined, undefined, {
      strict: true, normalizeMixerUnits: true,
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(startCalls).toContainEqual([1, 2, 1]);
  });

  it("universal Web mixdown schedules the same selected source window", async () => {
    (Platform as any).OS = "web";
    const { audioSystem } = await import("../src/lib/universalAudio");
    const blob = await audioSystem.renderMixdown([{
      id: "t1", volume: 100, pan: 0, muted: false, solo: false,
      regions: [{ start: 1, duration: 1, offset: 2, length: 1, url: "blob:fixture" }],
    }], 4, 44100);
    expect(blob).toBeInstanceOf(Blob);
    expect(startCalls).toContainEqual([1, 2, 1]);
  });

  it("native mixdown begins reading at source offset instead of sample zero", async () => {
    (Platform as any).OS = "ios";
    const wav = makeSegmentedWav(8);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => wav }));
    const { audioSystem } = await import("../src/lib/universalAudio");
    const blob = await audioSystem.renderMixdown([{
      id: "t1", volume: 100, pan: 0, muted: false, solo: false,
      regions: [{ start: 0, duration: 0.5, offset: 0.5, length: 0.5, url: "blob:segmented" }],
    }], 0.5, 8);
    const out = new DataView(await blob.arrayBuffer());
    expect(readSigned24(out, 44)).toBeLessThan(0);
  });

  it("renders the right-hand split from the later source segment", async () => {
    (Platform as any).OS = "ios";
    const wav = makeSegmentedWav(8);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => wav }));
    const { splitRegion } = await import("../src/lib/regionEdit");
    const { audioSystem } = await import("../src/lib/universalAudio");
    const [, right] = splitRegion(
      { id: "r", start: 0, duration: 1, offset: 0, length: 1, url: "blob:segmented" },
      0.5,
    );
    const blob = await audioSystem.renderMixdown([{
      id: "t1", volume: 100, pan: 0, muted: false, solo: false, regions: [right],
    }], 1, 8);
    const out = new DataView(await blob.arrayBuffer());
    const rightTimelineFrame = 4;
    const bytesPerStereo24Frame = 6;
    expect(readSigned24(out, 44 + rightTimelineFrame * bytesPerStereo24Frame)).toBeLessThan(0);
  });

  it("renders an inward start-trim from the later source segment", async () => {
    (Platform as any).OS = "ios";
    const wav = makeSegmentedWav(8);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => wav }));
    const { trimRegion } = await import("../src/lib/regionEdit");
    const { audioSystem } = await import("../src/lib/universalAudio");
    const trimmed = trimRegion(
      { id: "r", start: 0, duration: 1, offset: 0, length: 1, url: "blob:segmented" },
      "start",
      0.5,
      1,
    );
    const blob = await audioSystem.renderMixdown([{
      id: "t1", volume: 100, pan: 0, muted: false, solo: false, regions: [trimmed],
    }], 1, 8);
    const out = new DataView(await blob.arrayBuffer());
    const trimmedTimelineFrame = 4;
    const bytesPerStereo24Frame = 6;
    expect(readSigned24(out, 44 + trimmedTimelineFrame * bytesPerStereo24Frame)).toBeLessThan(0);
  });
});
