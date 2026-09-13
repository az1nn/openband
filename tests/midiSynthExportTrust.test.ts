import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Plugin, TrackDef } from "../src/lib/types";

const resolveAssetUrl = vi.fn(async (url: string) => url);
const getSharedAudioContext = vi.fn(() => null);
const createTrackedBlob = vi.fn((_blob: Blob) => "blob:tracked-export");
const applyPluginChain = vi.fn(async (buffer: AudioBuffer, plugins: Plugin[]) => {
  const enabled = plugins.filter((plugin) => plugin.enabled !== false);
  if (enabled.length === 0) return buffer;
  const scale = enabled.reduce(
    (value, plugin) => value * (plugin.params.testGain ?? 0.5),
    1,
  );
  return scaleBuffer(buffer, scale);
});

vi.mock("../src/lib/assetStore", () => ({ resolveAssetUrl }));
vi.mock("../src/lib/universalAudio", () => ({
  getSharedAudioContext,
  createTrackedBlob,
}));
vi.mock("../src/lib/pluginChain", () => ({ applyPluginChain }));
vi.mock("../src/lib/timeStretch", () => ({
  timeStretch: vi.fn(async (buffer: AudioBuffer) => buffer),
}));

class FakeParam {
  value: number;
  private scheduled = false;
  private scheduledPeak = 0;

  constructor(value: number) {
    this.value = value;
  }

  private schedule(value: number) {
    this.scheduled = true;
    this.scheduledPeak = Math.max(this.scheduledPeak, Math.abs(value));
    this.value = value;
  }

  setValueAtTime(value: number) {
    this.schedule(value);
    return this;
  }

  linearRampToValueAtTime(value: number) {
    this.schedule(value);
    return this;
  }

  exponentialRampToValueAtTime(value: number) {
    this.schedule(value);
    return this;
  }

  setTargetAtTime(value: number) {
    this.schedule(value);
    return this;
  }

  cancelScheduledValues() {
    return this;
  }

  effectiveValue() {
    return this.scheduled ? this.scheduledPeak : this.value;
  }
}

class FakeNode {
  connections: FakeNode[] = [];

  connect(target: FakeNode) {
    this.connections.push(target);
    return target;
  }

  disconnect() {
    this.connections = [];
  }
}

class FakeDestination extends FakeNode {}

class FakeGainNode extends FakeNode {
  gain = new FakeParam(1);
}

class FakePannerNode extends FakeNode {
  pan = new FakeParam(0);
}

class FakeBufferSourceNode extends FakeNode {
  buffer: AudioBuffer | null = null;
  started = false;
  startTime = 0;
  duration: number | undefined;
  loop = false;
  loopStart = 0;
  loopEnd = 0;
  onended: (() => void) | null = null;

  start(when = 0, _offset = 0, duration?: number) {
    this.started = true;
    this.startTime = when;
    this.duration = duration;
  }

  stop() {}
}

class FakeOscillatorNode extends FakeNode {
  frequency = new FakeParam(440);
  type: OscillatorType = "sine";
  started = false;
  startTime = 0;
  stopTime = Infinity;

  start(when = 0) {
    this.started = true;
    this.startTime = when;
  }

  stop(when = Infinity) {
    this.stopTime = when;
  }
}

function makeAudioBuffer(
  channels: number,
  length: number,
  sampleRate: number,
  fill?: (channel: number, data: Float32Array) => void,
): AudioBuffer {
  const data = Array.from({ length: channels }, () => new Float32Array(length));
  data.forEach((channel, index) => fill?.(index, channel));
  return {
    numberOfChannels: channels,
    length,
    sampleRate,
    duration: length / sampleRate,
    getChannelData: (channel: number) => data[channel],
    copyFromChannel: vi.fn(),
    copyToChannel: vi.fn(),
  } as unknown as AudioBuffer;
}

function scaleBuffer(buffer: AudioBuffer, gain: number): AudioBuffer {
  return makeAudioBuffer(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate,
    (channel, output) => {
      const input = buffer.getChannelData(channel);
      for (let i = 0; i < output.length; i++) output[i] = input[i] * gain;
    },
  );
}

const decodedFixture = () =>
  makeAudioBuffer(1, 256, 44100, (_channel, data) => {
    for (let i = 0; i < data.length; i++) {
      data[i] = i % 2 === 0 ? 0.8 : -0.8;
    }
  });

class FakeOfflineAudioContext {
  readonly destination = new FakeDestination();
  readonly sampleRate: number;
  readonly length: number;
  currentTime = 0;
  private readonly sources: FakeBufferSourceNode[] = [];
  private readonly oscillators: FakeOscillatorNode[] = [];

  constructor(_channels: number, length: number, sampleRate: number) {
    this.length = Math.max(1, length);
    this.sampleRate = sampleRate;
  }

  createGain() {
    return new FakeGainNode() as unknown as GainNode;
  }

  createStereoPanner() {
    return new FakePannerNode() as unknown as StereoPannerNode;
  }

  createBufferSource() {
    const source = new FakeBufferSourceNode();
    this.sources.push(source);
    return source as unknown as AudioBufferSourceNode;
  }

  createOscillator() {
    const oscillator = new FakeOscillatorNode();
    this.oscillators.push(oscillator);
    return oscillator as unknown as OscillatorNode;
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    return makeAudioBuffer(channels, length, sampleRate);
  }

  createBiquadFilter() {
    const node = new FakeNode() as FakeNode & {
      type: BiquadFilterType;
      frequency: FakeParam;
      Q: FakeParam;
    };
    node.type = "lowpass";
    node.frequency = new FakeParam(350);
    node.Q = new FakeParam(1);
    return node as unknown as BiquadFilterNode;
  }

  createConvolver() {
    const node = new FakeNode() as FakeNode & { buffer: AudioBuffer | null };
    node.buffer = null;
    return node as unknown as ConvolverNode;
  }

  decodeAudioData(_data: ArrayBuffer) {
    return Promise.resolve(decodedFixture());
  }

  close() {
    return Promise.resolve();
  }

  private renderThroughGraph(
    node: FakeNode,
    left: number,
    right: number,
    output: AudioBuffer,
    index: number,
  ) {
    let nextLeft = left;
    let nextRight = right;

    if (node instanceof FakeGainNode) {
      const gain = node.gain.effectiveValue();
      nextLeft *= gain;
      nextRight *= gain;
    } else if (node instanceof FakePannerNode) {
      const pan = Math.max(-1, Math.min(1, node.pan.effectiveValue()));
      const leftGain = pan > 0 ? 1 - pan : 1;
      const rightGain = pan < 0 ? 1 + pan : 1;
      nextLeft *= leftGain;
      nextRight *= rightGain;
    }

    if (node === this.destination) {
      output.getChannelData(0)[index] += nextLeft;
      output.getChannelData(1)[index] += nextRight;
      return;
    }

    for (const connection of node.connections) {
      this.renderThroughGraph(connection, nextLeft, nextRight, output, index);
    }
  }

  async startRendering() {
    const output = makeAudioBuffer(2, this.length, this.sampleRate);

    for (const source of this.sources) {
      if (!source.started || !source.buffer) continue;
      const startIndex = Math.max(0, Math.floor(source.startTime * this.sampleRate));
      const maxSamples = source.duration
        ? Math.min(source.buffer.length, Math.ceil(source.duration * this.sampleRate))
        : source.buffer.length;
      for (let i = 0; i < maxSamples && startIndex + i < output.length; i++) {
        const left = source.buffer.getChannelData(0)[i] ?? 0;
        const right = source.buffer.numberOfChannels > 1
          ? source.buffer.getChannelData(1)[i] ?? 0
          : left;
        for (const connection of source.connections) {
          this.renderThroughGraph(connection, left, right, output, startIndex + i);
        }
      }
    }

    for (const oscillator of this.oscillators) {
      if (!oscillator.started) continue;
      const startIndex = Math.max(0, Math.floor(oscillator.startTime * this.sampleRate));
      const stopIndex = Math.min(
        output.length,
        Number.isFinite(oscillator.stopTime)
          ? Math.ceil(oscillator.stopTime * this.sampleRate)
          : startIndex + 2048,
      );
      const frequency = oscillator.frequency.effectiveValue();
      for (let i = startIndex; i < stopIndex; i++) {
        const sample = Math.sin((2 * Math.PI * frequency * (i - startIndex)) / this.sampleRate);
        for (const connection of oscillator.connections) {
          this.renderThroughGraph(connection, sample, sample, output, i);
        }
      }
    }

    return output;
  }
}

vi.stubGlobal(
  "OfflineAudioContext",
  FakeOfflineAudioContext as unknown as typeof OfflineAudioContext,
);

function track(overrides: Partial<TrackDef> = {}): TrackDef {
  return {
    id: overrides.id ?? "track-1",
    name: overrides.name ?? "Audio",
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

function audioRegionTrack(overrides: Partial<TrackDef> = {}): TrackDef {
  return track({
    regions: [{ id: "region-1", start: 0, duration: 256 / 44100, url: "asset://fixture" }],
    ...overrides,
  });
}

async function wavEnergy(blob: Blob) {
  const bytes = await blob.arrayBuffer();
  const view = new DataView(bytes);
  const channels = view.getUint16(22, true);
  const bitsPerSample = view.getUint16(34, true);
  expect(channels).toBe(2);
  expect(bitsPerSample).toBe(16);

  let offset = 12;
  while (offset + 8 <= view.byteLength) {
    const id = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3),
    );
    const size = view.getUint32(offset + 4, true);
    if (id === "data") {
      let left = 0;
      let right = 0;
      let peak = 0;
      for (let p = offset + 8; p + 3 < Math.min(view.byteLength, offset + 8 + size); p += 4) {
        const l = view.getInt16(p, true) / 32768;
        const r = view.getInt16(p + 2, true) / 32768;
        left += l * l;
        right += r * r;
        peak = Math.max(peak, Math.abs(l), Math.abs(r));
      }
      return { left, right, peak };
    }
    offset += 8 + size + (size % 2);
  }
  return { left: 0, right: 0, peak: 0 };
}

async function render(tracks: TrackDef[], masterPlugins: Plugin[] = []) {
  const { renderTracksToWavBlob } = await import("../src/lib/midiSynth");
  const blob = await renderTracksToWavBlob(
    tracks,
    120,
    undefined,
    [],
    masterPlugins,
    { strict: true, normalizeMixerUnits: true },
  );
  expect(blob).toBeInstanceOf(Blob);
  return blob!;
}

describe("strict full-project Web export renderer", () => {
  beforeEach(() => {
    resolveAssetUrl.mockReset();
    resolveAssetUrl.mockImplementation(async (url: string) => url);
    getSharedAudioContext.mockReturnValue(null);
    createTrackedBlob.mockClear();
    applyPluginChain.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ arrayBuffer: async () => new ArrayBuffer(8) })),
    );
  });

  it("normalizes percentage volume and pan into audible stereo output", async () => {
    const fullLeft = await wavEnergy(await render([
      audioRegionTrack({ volume: 100, pan: -100 }),
    ]));
    const quarterRight = await wavEnergy(await render([
      audioRegionTrack({ volume: 25, pan: 100 }),
    ]));

    expect(fullLeft.left).toBeGreaterThan(0);
    expect(fullLeft.right).toBeLessThan(fullLeft.left * 0.01);
    expect(quarterRight.right).toBeGreaterThan(0);
    expect(quarterRight.left).toBeLessThan(quarterRight.right * 0.01);
    expect(quarterRight.peak).toBeLessThan(fullLeft.peak * 0.35);
  });

  it("honors mute and solo before scheduling sources", async () => {
    const soloMix = await wavEnergy(await render([
      audioRegionTrack({ id: "solo", solo: true, pan: -100 }),
      audioRegionTrack({ id: "other", pan: 100 }),
      audioRegionTrack({ id: "muted", muted: true, pan: 100 }),
    ]));

    expect(soloMix.left).toBeGreaterThan(0);
    expect(soloMix.right).toBeLessThan(soloMix.left * 0.01);
  });

  it("exports MIDI-only material as audible WAV", async () => {
    const energy = await wavEnergy(await render([
      track({
        name: "Keys",
        midiNotes: [{ pitch: 60, start: 0, duration: 0.25, velocity: 110 }],
      }),
    ]));

    expect(energy.peak).toBeGreaterThan(0.01);
    expect(energy.left).toBeGreaterThan(0);
    expect(energy.right).toBeGreaterThan(0);
  });

  it("applies launch-scope track and master effect chains", async () => {
    const baseline = await wavEnergy(await render([
      audioRegionTrack({ volume: 100 }),
    ]));
    const trackPlugin: Plugin = {
      id: "track-fx",
      name: "Deterministic test effect",
      type: "eq",
      enabled: true,
      params: { testGain: 0.5 },
    };
    const masterPlugin: Plugin = {
      id: "master-fx",
      name: "Deterministic master effect",
      type: "limiter",
      enabled: true,
      params: { testGain: 0.5 },
    };
    const effected = await wavEnergy(await render([
      audioRegionTrack({ volume: 100, plugins: [trackPlugin] }),
    ], [masterPlugin]));

    expect(applyPluginChain).toHaveBeenCalledWith(
      expect.anything(),
      [trackPlugin],
      44100,
      expect.any(Object),
    );
    expect(applyPluginChain).toHaveBeenCalledWith(
      expect.anything(),
      [masterPlugin],
      44100,
      expect.any(Object),
    );
    expect(effected.peak).toBeLessThan(baseline.peak * 0.35);
  });

  it("fails explicitly when a required durable source cannot resolve", async () => {
    const { FullProjectRenderError, renderTracksToWavBlob } = await import("../src/lib/midiSynth");
    resolveAssetUrl.mockRejectedValueOnce(new Error("asset missing"));

    await expect(renderTracksToWavBlob(
      [audioRegionTrack()],
      120,
      undefined,
      [],
      [],
      { strict: true, normalizeMixerUnits: true },
    )).rejects.toMatchObject({
      name: FullProjectRenderError.name,
      stage: "source",
    });
  });

  it("keeps the legacy URL wrapper compatible outside strict export", async () => {
    const { renderTracksToUrl } = await import("../src/lib/midiSynth");
    await expect(renderTracksToUrl([audioRegionTrack()], 120)).resolves.toBe("blob:tracked-export");
    expect(createTrackedBlob).toHaveBeenCalledWith(expect.any(Blob));
  });
});
