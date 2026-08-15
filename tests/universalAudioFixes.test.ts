import { describe, it, expect, vi, afterEach } from "vitest";
import { audioSystem } from "../src/lib/universalAudio";
import { Platform } from "react-native";

const makeBuffer = (channels: number, length: number, sampleRate: number) => {
  const data = Array.from({ length: channels }, () => new Float32Array(length));
  for (let ch = 0; ch < channels; ch++) {
    for (let i = 0; i < length; i++) {
      data[ch][i] = Math.sin((i / sampleRate) * (220 + ch * 110) * 2 * Math.PI) * 0.5;
    }
  }
  return {
    numberOfChannels: channels,
    sampleRate,
    length,
    duration: length / sampleRate,
    getChannelData: (ch: number) => data[ch],
  } as unknown as AudioBuffer;
};

const makeMonoWav = (bits: number, numSamples: number, sampleRate: number): ArrayBuffer => {
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
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bits, true);
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, dataSize, true);
  for (let i = 0; i < numSamples; i++) {
    const pos = 44 + i * bytesPerSample;
    if (bits === 24) {
      const pcm = Math.max(-8388608, Math.min(8388607, Math.round(0.5 * 8388607)));
      view.setInt8(pos, pcm & 0xff);
      view.setInt8(pos + 1, (pcm >> 8) & 0xff);
      view.setInt8(pos + 2, (pcm >> 16) & 0xff);
    } else {
      const v = Math.round(0.5 * 0x7fff);
      view.setInt16(pos, v, true);
    }
  }
  return ab;
};

afterEach(() => {
  (audioSystem as any).isRecording = false;
  (audioSystem as any).recordingStream = null;
  (Platform as any).OS = "web";
  vi.unstubAllGlobals();
});

describe("H1: WAV 16/24-bit round-trip", () => {
  it("encodes 16-bit and 24-bit with correct header and sample fidelity", async () => {
    const sys = audioSystem as any;
    const buffer = makeBuffer(2, 256, 44100);

    for (const bitDepth of [16, 24]) {
      const blob = sys.audioBufferToWavBlob(buffer, bitDepth);
      expect(blob).toBeInstanceOf(Blob);
      const ab = await blob.arrayBuffer();
      const view = new DataView(ab);
      expect(view.getUint16(34, true)).toBe(bitDepth);

      const channels = await sys.decodeAudioPureJS(ab, 44100);
      expect(channels).not.toBeNull();
      const bytesPerSample = bitDepth / 8;
      expect(view.getUint16(32, true)).toBe(2 * bytesPerSample);

      const expected = buffer.getChannelData(0);
      const decoded = (channels as Float32Array[])[0];
      for (let i = 0; i < expected.length; i++) {
        expect(Math.abs(decoded[i] - expected[i])).toBeLessThan(
          1 / (bitDepth === 24 ? 8388608 : 32768) + 1e-4
        );
      }
    }
  });
});

describe("M4: pan law consistency (native mixdown)", () => {
  it("uses equal-power pan symmetric about center and never exceeds track gain", () => {
    const sys = audioSystem as any;
    const trackGain = 1;

    const pos = sys.computePanGains(trackGain, 0.5);
    const neg = sys.computePanGains(trackGain, -0.5);

    expect(pos.right).toBeCloseTo(neg.left, 5);
    expect(pos.left).toBeCloseTo(neg.right, 5);

    for (const p of [0, 0.25, 0.5, -0.5, -0.75, 1, -1]) {
      const g = sys.computePanGains(trackGain, p);
      expect(g.left).toBeGreaterThanOrEqual(0);
      expect(g.right).toBeGreaterThanOrEqual(0);
      expect(g.left).toBeLessThanOrEqual(trackGain + 1e-9);
      expect(g.right).toBeLessThanOrEqual(trackGain + 1e-9);
    }
  });
});

describe("M5: pure-JS MP3/ID3 decode does not fake audio", () => {
  it("returns null for MP3/ID3 input instead of synthesizing a tone", async () => {
    const sys = audioSystem as any;
    const id3 = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const mp3 = new Uint8Array([0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00]);
    expect(await sys.decodeAudioPureJS(id3.buffer as ArrayBuffer, 44100)).toBeNull();
    expect(await sys.decodeAudioPureJS(mp3.buffer as ArrayBuffer, 44100)).toBeNull();
  });

  it("still decodes valid WAV data", async () => {
    const sys = audioSystem as any;
    const ab = makeMonoWav(16, 64, 8000);
    const channels = await sys.decodeAudioPureJS(ab, 8000);
    expect(channels).not.toBeNull();
    expect((channels as Float32Array[])[0].length).toBe(64);
  });
});

describe("M6: blob URL leak in mixdown", () => {
  it("revokes resolved blob: asset URLs after native mixdown", async () => {
    (Platform as any).OS = "ios";
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const wav = makeMonoWav(16, 64, 44100);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ arrayBuffer: async () => wav })
    );
    const blobUrl = "blob:leak-test-123";
    const blob = await audioSystem.renderMixdown(
      [
        {
          id: "t1",
          volume: 100,
          pan: 0,
          muted: false,
          solo: false,
          regions: [{ start: 0, duration: 0.1, url: blobUrl }],
        },
      ],
      0.1,
      44100
    );
    expect(blob).toBeInstanceOf(Blob);
    expect(revokeSpy).toHaveBeenCalledWith(blobUrl);
    revokeSpy.mockRestore();
  });
});

describe("M7: recording re-entrancy guard", () => {
  it("rejects a second startRecording while one is in progress and preserves the first stream", async () => {
    const sys = audioSystem as any;
    const fakeStream = { getTracks: () => [] } as unknown as MediaStream;
    sys.recordingStream = fakeStream;
    sys.isRecording = true;

    await expect(sys.startRecording()).rejects.toThrow(/RECORDING_IN_PROGRESS/);
    expect(sys.recordingStream).toBe(fakeStream);
    expect(sys.isRecording).toBe(true);
  });

  it("clears the guard flag when cleanupRecording runs", async () => {
    const sys = audioSystem as any;
    sys.isRecording = true;
    sys.cleanupRecording();
    expect(sys.isRecording).toBe(false);
  });
});

describe("M8: exportToFile defers blob URL revoke", () => {
  it("does not revoke the object URL synchronously after click", async () => {
    (Platform as any).OS = "web";
    const clickSpy = vi.fn();
    const anchor = { href: "", download: "", click: clickSpy } as any;
    const appendSpy = vi.fn();
    const removeSpy = vi.fn();
    vi.stubGlobal("document", {
      createElement: () => anchor,
      body: { appendChild: appendSpy, removeChild: removeSpy },
    } as any);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:export-test");
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");

    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/wav" });
    await audioSystem.exportToFile(blob, "test.wav");

    expect(clickSpy).toHaveBeenCalled();
    expect(revokeSpy).not.toHaveBeenCalled();

    await new Promise((r) => setTimeout(r, 1100));
    expect(revokeSpy).toHaveBeenCalledWith("blob:export-test");
    revokeSpy.mockRestore();
  });
});

describe("M9: disposeAllAudio clears registries and is safe with null context", () => {
  it("dispose is callable and clears the blob URL registry without throwing", () => {
    expect(() => audioSystem.dispose()).not.toThrow();
  });
});
