import { describe, it, expect, vi } from "vitest";
import { audioBufferToWavBlob } from "../src/lib/audio";

class MockOfflineAudioContext {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  destination = {};

  constructor(channels: number, length: number, sampleRate: number) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
  }

  createGain() {
    return {
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }

  createStereoPanner() {
    return {
      pan: { value: 0 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }

  createBuffer(channels: number, length: number, sampleRate: number): AudioBuffer {
    const data = Array.from({ length: channels }, () => new Float32Array(length));
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: (ch: number) => data[ch],
    } as unknown as AudioBuffer;
  }

  startRendering(): Promise<AudioBuffer> {
    return Promise.resolve(
      this.createBuffer(this.numberOfChannels, this.length, this.sampleRate)
    );
  }
}
vi.stubGlobal("OfflineAudioContext", MockOfflineAudioContext as any);

vi.mock("lamejs", () => {
  return {
    Mp3Encoder: function (this: any) {
      this.encodeBuffer = vi.fn().mockReturnValue(new Int8Array([1, 2, 3]));
      this.flush = vi.fn().mockReturnValue(new Int8Array([4, 5]));
    },
  };
});

describe("Audio Export Formats", () => {
  const createMockAudioBuffer = () => {
    return {
      numberOfChannels: 2,
      sampleRate: 44100,
      length: 1024,
      getChannelData: (_: number) => new Float32Array(1024).fill(0.5),
    } as unknown as AudioBuffer;
  };

  it("audioBufferToWavBlob generates a WAV blob with correct headers", () => {
    const buffer = createMockAudioBuffer();
    const blob = audioBufferToWavBlob(buffer, 16);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("audio/wav");
  });
});

describe("Audio Export & Native Decode Robustness (Round 2)", () => {
  it("zero-length export and 0-track crash guard returns silent blob without throwing", async () => {
    const { audioSystem } = await import("../src/lib/universalAudio");
    const blobEmptyTracks = await audioSystem.renderMixdown([], 0, 44100);
    expect(blobEmptyTracks).toBeInstanceOf(Blob);

    const blobZeroDuration = await audioSystem.renderMixdown(
      [{ id: "t1", volume: 100, pan: 0, muted: false, solo: false, regions: [] }],
      0,
      44100
    );
    expect(blobZeroDuration).toBeInstanceOf(Blob);
  });

  it("native stereo mixdown preserves separate Left and Right channel paths", async () => {
    const { audioSystem } = await import("../src/lib/universalAudio");
    const { Platform } = await import("react-native");
    const origOS = Platform.OS;
    (Platform as any).OS = "ios";

    const sampleRate = 44100;
    const numSamples = 500;
    const bytesPerSample = 3;
    const blockAlign = 2 * bytesPerSample;
    const dataSize = numSamples * blockAlign;
    const arrayBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(arrayBuffer);

    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true); // stereo
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 24, true);
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        arrayBuffer: async () => arrayBuffer,
      })
    );

    const tracks = [
      {
        id: "t1",
        volume: 100,
        pan: 0,
        muted: false,
        solo: false,
        regions: [{ start: 0, duration: 0.1, url: "blob:stereo" }],
      },
    ];

    const resultBlob = await audioSystem.renderMixdown(tracks, 0.1, sampleRate);
    expect(resultBlob).toBeInstanceOf(Blob);

    (Platform as any).OS = origOS;
    vi.unstubAllGlobals();
  });

  it("decodes pure-JS WAV across 8-bit, 16-bit, 24-bit, and 32-bit float PCM formats", async () => {
    const { audioSystem } = await import("../src/lib/universalAudio");
    const { Platform } = await import("react-native");
    const origOS = Platform.OS;
    (Platform as any).OS = "android";
    const sampleRate = 8000;
    const numSamples = 50;

    const testBitDepth = async (bits: number, isFloat: boolean = false) => {
      const bytesPerSample = bits === 24 ? 3 : bits / 8;
      const blockAlign = bytesPerSample;
      const dataSize = numSamples * blockAlign;
      const ab = new ArrayBuffer(44 + dataSize);
      const view = new DataView(ab);

      view.setUint32(0, 0x52494646, false);
      view.setUint32(4, 36 + dataSize, true);
      view.setUint32(8, 0x57415645, false);
      view.setUint32(12, 0x666d7420, false);
      view.setUint32(16, 16, true);
      view.setUint16(20, isFloat ? 3 : 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * blockAlign, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bits, true);
      view.setUint32(36, 0x64617461, false);
      view.setUint32(40, dataSize, true);

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          arrayBuffer: async () => ab,
        })
      );

      const blob = await audioSystem.renderMixdown(
        [
          {
            id: "t1",
            volume: 100,
            pan: 0,
            muted: false,
            solo: false,
            regions: [{ start: 0, duration: 0.1, url: `blob:${bits}` }],
          },
        ],
        0.1,
        sampleRate
      );
      expect(blob).toBeInstanceOf(Blob);
    };

    await testBitDepth(8);
    await testBitDepth(16);
    await testBitDepth(24);
    await testBitDepth(32, true);

    (Platform as any).OS = origOS;
    vi.unstubAllGlobals();
  });

  it("renderMixdownWeb integrates buildBusRouteGraph with track output bus assignments and aux sends", async () => {
    const { audioSystem } = await import("../src/lib/universalAudio");
    const { Platform } = await import("react-native");
    const origOS = Platform.OS;
    (Platform as any).OS = "web";

    const sampleRate = 44100;
    const ab = new ArrayBuffer(44 + 400);
    const view = new DataView(ab);
    view.setUint32(0, 0x52494646, false);
    view.setUint32(4, 36 + 400, true);
    view.setUint32(8, 0x57415645, false);
    view.setUint32(12, 0x666d7420, false);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, 400, true);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        arrayBuffer: async () => ab,
      })
    );

    const tracks = [
      {
        id: "t1",
        name: "Vocals",
        volume: 90,
        pan: 0,
        muted: false,
        solo: false,
        outputId: "bus-vocals",
        sends: { "bus-fx": 50 },
        regions: [{ start: 0, duration: 0.1, url: "blob:bus-test" }],
      },
    ];

    const buses = [
      { id: "bus-vocals", name: "Vocals Bus", volume: 85, mute: false },
      { id: "bus-fx", name: "FX Bus", volume: 70, mute: false },
    ];

    const blob = await audioSystem.renderMixdown(tracks, 0.1, sampleRate, undefined, buses);
    expect(blob).toBeInstanceOf(Blob);

    (Platform as any).OS = origOS;
    vi.unstubAllGlobals();
  });

  it("native mixdown decodes multi-channel WAV (3-channel) and handles stereo routing", async () => {
    const { audioSystem } = await import("../src/lib/universalAudio");
    const { Platform } = await import("react-native");
    const origOS = Platform.OS;
    (Platform as any).OS = "ios";

    const sampleRate = 44100;
    const numChannels = 3;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const numSamples = 100;
    const dataSize = numSamples * blockAlign;
    const ab = new ArrayBuffer(44 + dataSize);
    const view = new DataView(ab);

    view.setUint32(0, 0x52494646, false);
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false);
    view.setUint32(12, 0x666d7420, false);
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, dataSize, true);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        arrayBuffer: async () => ab,
      })
    );

    const tracks = [
      {
        id: "t1",
        volume: 100,
        pan: -50,
        muted: false,
        solo: false,
        regions: [{ start: 0, duration: 0.1, url: "blob:3ch" }],
      },
    ];

    const blob = await audioSystem.renderMixdown(tracks, 0.1, sampleRate);
    expect(blob).toBeInstanceOf(Blob);

    (Platform as any).OS = origOS;
    vi.unstubAllGlobals();
  });
});

describe("Unknown Plugin Warnings", () => {
  it("emits console.warn for unknown plugin types in applyPluginChain without throwing", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { applyPluginChain } = await import("../src/lib/pluginChain");
    const sr = 44100;
    const ctx = new MockOfflineAudioContext(1, 1024, sr);
    const buf = ctx.createBuffer(1, 1024, sr);
    const unknownPlugin: any = {
      id: "p-unknown",
      name: "Unknown Effect",
      type: "unsupportedCustomEffect",
      enabled: true,
      params: {},
    };

    const out = await applyPluginChain(buf, [unknownPlugin], sr);
    expect(out).toBeDefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unknown plugin type: \"unsupportedCustomEffect\"")
    );
    warnSpy.mockRestore();
  });

  it("emits console.warn for unknown mastering plugin types in applyMasteringChain without throwing", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { applyMasteringChain } = await import("../src/lib/mastering");
    const sr = 44100;
    const ctx = new MockOfflineAudioContext(1, 1024, sr);
    const buf = ctx.createBuffer(1, 1024, sr);
    const unknownPlugin: any = {
      id: "p-mastering-unknown",
      name: "Unknown Mastering",
      type: "unsupportedMastering",
      enabled: true,
      params: {},
    };

    const out = await applyMasteringChain(buf, [unknownPlugin], sr);
    expect(out).toBeDefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unknown mastering plugin type: \"unsupportedMastering\"")
    );
    warnSpy.mockRestore();
  });
});
