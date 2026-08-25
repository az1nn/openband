import { vi, describe, it, expect, beforeEach } from "vitest";
import { timeStretch, pitchShift } from "../src/lib/timeStretch";

function makeAudioBuffer(
  channels: number,
  length: number,
  sampleRate: number,
): AudioBuffer {
  const data = Array.from({ length: channels }, () => new Float32Array(length));
  return {
    numberOfChannels: channels,
    length,
    sampleRate,
    duration: length / sampleRate,
    getChannelData: (ch: number) => data[ch],
  } as unknown as AudioBuffer;
}

class MockOfflineAudioContext {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  constructor(c: number, l: number, sr: number) {
    this.numberOfChannels = c;
    this.length = l;
    this.sampleRate = sr;
  }
  createBuffer(c: number, l: number, sr: number) {
    return makeAudioBuffer(c, l, sr);
  }
  startRendering() {
    return Promise.resolve(
      makeAudioBuffer(this.numberOfChannels, this.length, this.sampleRate),
    );
  }
}

function rms(buf: AudioBuffer, ch: number): number {
  const d = buf.getChannelData(ch);
  let s = 0;
  for (let i = 0; i < d.length; i++) s += d[i] * d[i];
  return Math.sqrt(s / d.length);
}

function fillSine(buf: AudioBuffer, ch: number, freq: number): void {
  const d = buf.getChannelData(ch);
  for (let i = 0; i < d.length; i++) {
    d[i] = Math.sin((2 * Math.PI * freq * i) / buf.sampleRate);
  }
}

describe("timeStretch COLA normalization", () => {
  beforeEach(() => {
    vi.stubGlobal("OfflineAudioContext", MockOfflineAudioContext as never);
  });

  it("preserves length for rate 0.5 and 2.0", async () => {
    const input = makeAudioBuffer(1, 4410, 44100);
    fillSine(input, 0, 1000);
    for (const rate of [0.5, 2.0]) {
      const out = await timeStretch(input, rate);
      expect(Math.abs(out.length - Math.round(input.length / rate))).toBeLessThanOrEqual(1);
    }
  });

  it("is finite and gain-correct (no ripple) at rate 0.5/2.0", async () => {
    const input = makeAudioBuffer(1, 4410, 44100);
    fillSine(input, 0, 1000);
    const inRms = rms(input, 0);
    for (const rate of [0.5, 2.0]) {
      const out = await timeStretch(input, rate);
      const od = out.getChannelData(0);
      for (let i = 0; i < od.length; i++) expect(Number.isFinite(od[i])).toBe(true);
      const oRms = rms(out, 0);
      expect(oRms).toBeGreaterThan(inRms * 0.8);
      expect(oRms).toBeLessThan(inRms * 1.2);

      const half = Math.floor(od.length / 2);
      let s1 = 0;
      let s2 = 0;
      for (let i = 0; i < half; i++) s1 += od[i] * od[i];
      for (let i = half; i < od.length; i++) s2 += od[i] * od[i];
      const r1 = Math.sqrt(s1 / half);
      const r2 = Math.sqrt(s2 / (od.length - half));
      expect(r2).toBeGreaterThan(r1 * 0.8);
      expect(r2).toBeLessThan(r1 * 1.2);
    }
  });
});

describe("pitchShift gain correction", () => {
  beforeEach(() => {
    vi.stubGlobal("OfflineAudioContext", MockOfflineAudioContext as never);
  });

  it("returns the same buffer for semitones=0 (early return)", async () => {
    const input = makeAudioBuffer(1, 4410, 44100);
    fillSine(input, 0, 1000);
    const out = await pitchShift(input, 0);
    expect(out).toBe(input);
    expect(rms(out, 0)).toBeCloseTo(rms(input, 0), 5);
  });

  it("keeps length and stays finite for semitones=12", async () => {
    const input = makeAudioBuffer(1, 4410, 44100);
    fillSine(input, 0, 1000);
    const out = await pitchShift(input, 12);
    expect(out.length).toBe(input.length);
    const od = out.getChannelData(0);
    for (let i = 0; i < od.length; i++) expect(Number.isFinite(od[i])).toBe(true);
  });
});
