import { describe, it, expect } from "vitest";
import { buildSilentWavBlob } from "../src/lib/universalAudio";

describe("buildSilentWavBlob M5 valid WAV", () => {
  it("produces a valid 16-bit mono WAV header with correct sizes", async () => {
    const duration = 1;
    const sampleRate = 44100;
    const blob = buildSilentWavBlob(duration, sampleRate);
    const buf = await blob.arrayBuffer();
    const view = new DataView(buf);
    const ascii = (o: number, n: number) =>
      Array.from({ length: n }, (_, i) => String.fromCharCode(view.getUint8(o + i))).join("");

    expect(ascii(0, 4)).toBe("RIFF");
    expect(ascii(8, 4)).toBe("WAVE");
    expect(ascii(12, 4)).toBe("fmt ");
    expect(ascii(36, 4)).toBe("data");

    const numSamples = Math.ceil(sampleRate * duration);
    const dataSize = numSamples * 2;
    expect(view.getUint32(4, true)).toBe(36 + dataSize);
    expect(view.getUint32(40, true)).toBe(dataSize);
    expect(buf.byteLength).toBe(44 + dataSize);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(sampleRate);
    expect(view.getUint16(34, true)).toBe(16);
  });

  it("never returns an empty/invalid 44-byte zero buffer", async () => {
    const blob = buildSilentWavBlob(0.5, 48000);
    expect(blob.size).toBeGreaterThan(44);
  });
});
