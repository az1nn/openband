import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

class MockParam {
  value: number;
  setValueAtTime: (v: number, t: number) => void;
  linearRampToValueAtTime: (v: number, t: number) => void;
  setTargetAtTime: () => void;
  cancelScheduledValues: () => void;
  constructor(record: number[]) {
    this.value = 0;
    this.setValueAtTime = (_v: number, t: number) => {
      record.push(t);
    };
    this.linearRampToValueAtTime = (_v: number, t: number) => {
      record.push(t);
    };
    this.setTargetAtTime = () => {};
    this.cancelScheduledValues = () => {};
  }
}

describe("applyPluginChain region-relative modulation (M14)", () => {
  const scheduledTimes: number[] = [];

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

    createBufferSource() {
      return {
        buffer: null as AudioBuffer | null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
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

    createBiquadFilter() {
      return {
        type: "lowpass" as BiquadFilterType,
        frequency: new MockParam(scheduledTimes),
        Q: new MockParam(scheduledTimes),
        gain: new MockParam(scheduledTimes),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }

    createGain() {
      return {
        gain: new MockParam(scheduledTimes),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }

    createStereoPanner() {
      return {
        pan: new MockParam(scheduledTimes),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }

    startRendering(): Promise<AudioBuffer> {
      return Promise.resolve(
        this.createBuffer(this.numberOfChannels, this.length, this.sampleRate)
      );
    }
  }

  beforeEach(() => {
    scheduledTimes.length = 0;
    vi.stubGlobal("OfflineAudioContext", MockOfflineAudioContext as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("schedules modulation within the region-length OfflineAudioContext when region.start is large", async () => {
    const { applyPluginChain } = await import("../src/lib/pluginChain");
    const { setModulationState } = await import("../src/lib/modulationMatrix");

    setModulationState({
      routes: [
        {
          id: "mod-freq",
          source: "lfo1",
          target: "filter.cutoff",
          amount: 0.5,
          bipolar: false,
          enabled: true,
        },
      ],
    });

    const sampleRate = 44100;
    const regionStart = 10;
    const regionLength = 2;
    const len = Math.floor(regionLength * sampleRate);
    const ctx = new MockOfflineAudioContext(1, len, sampleRate);
    const buffer = ctx.createBuffer(1, len, sampleRate);

    const filterPlugin: any = {
      id: "p-filter",
      name: "Filter",
      type: "filter",
      enabled: true,
      params: { mode: 0, freq: 1000, resonance: 30 },
    };

    await applyPluginChain(buffer, [filterPlugin], sampleRate, {
      modTime: regionStart,
      duration: regionLength,
    });

    expect(scheduledTimes.length).toBeGreaterThan(0);
    for (const t of scheduledTimes) {
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(regionLength);
    }

    setModulationState({ routes: [] });
  });
});
