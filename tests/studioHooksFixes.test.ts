import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockPlatform = { OS: "web" as string };
vi.mock("react-native", () => ({
  Platform: {
    get OS() {
      return mockPlatform.OS;
    },
  },
}));

const mocks = vi.hoisted(() => ({
  revokeTrackedBlob: vi.fn(),
  createTrackedBlob: vi.fn((_b: unknown) => "blob:tracked:" + Math.random()),
  markBlobActive: vi.fn(),
  ensureContext: vi.fn(),
  renderTracksToUrl: vi.fn(),
}));

vi.mock("../src/lib/universalAudio", () => ({
  audioSystem: { ensureContext: mocks.ensureContext, resumeForGesture: vi.fn() },
  createTrackedBlob: mocks.createTrackedBlob,
  markBlobActive: mocks.markBlobActive,
  revokeTrackedBlob: mocks.revokeTrackedBlob,
}));

vi.mock("../src/lib/midiSynth", () => ({
  renderTracksToUrl: (...args: unknown[]) => mocks.renderTracksToUrl(...args),
  disposeAudioContext: vi.fn(),
  getProjectDurationSeconds: vi.fn(() => 10),
}));

vi.mock("../src/lib/timeStretch", () => ({
  pitchShift: vi.fn(async (buf: unknown) => buf),
}));

import * as audioLib from "../src/lib/audio";
import {
  renderTracksCached,
  applyPitchShift,
  createTransportLock,
  type RenderCache,
} from "../app/studio/hooks";

const fakeBuffer = {
  numberOfChannels: 2,
  length: 100,
  sampleRate: 44100,
  getChannelData: () => new Float32Array(100),
};

class MockOfflineAudioContext {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  destination = {};
  constructor(ch: number, len: number, sr: number) {
    this.numberOfChannels = ch;
    this.length = len;
    this.sampleRate = sr;
  }
  createBufferSource() {
    return { buffer: null, connect: vi.fn(), start: vi.fn(), disconnect: vi.fn() };
  }
  startRendering() {
    return Promise.resolve(fakeBuffer);
  }
}

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL: () => "blob:mock",
    revokeObjectURL: () => {},
  });
  vi.stubGlobal("OfflineAudioContext", MockOfflineAudioContext as any);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(8) }),
  );
  mocks.revokeTrackedBlob.mockClear();
  mocks.createTrackedBlob.mockClear();
  mocks.markBlobActive.mockClear();
  mocks.ensureContext.mockReset();
  mocks.renderTracksToUrl.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const tracksFixture = [
  {
    id: "t1",
    name: "Track",
    volume: 80,
    pan: 0,
    muted: false,
    solo: false,
    regions: [{ start: 0, duration: 1, url: "blob:src" }],
    midiNotes: [],
    plugins: [],
  },
] as any;

describe("H1 — applyPitchShift passes explicit bitDepth to audioBufferToWavBlob", () => {
  it("encodes the rendered buffer with bitDepth 16", async () => {
    mocks.ensureContext.mockResolvedValue({
      decodeAudioData: async () => fakeBuffer,
    });
    const spy = vi
      .spyOn(audioLib, "audioBufferToWavBlob")
      .mockReturnValue(new Blob());

    const result = await applyPitchShift("blob:source", 2);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.anything(), 16);
    expect(result).toMatch(/^blob:tracked:/);
    spy.mockRestore();
  });
});

describe("M2 — per-instance render cache does not reuse a revoked URL", () => {
  it("re-renders after a pitch shift revokes the cached URL", async () => {
    mocks.renderTracksToUrl.mockResolvedValue("blob:render1");

    const cache: RenderCache = { key: null, url: null };
    const url1 = await renderTracksCached(tracksFixture, 120, undefined, [], undefined, cache);
    expect(url1).toBe("blob:render1");
    expect(cache.url).toBe("blob:render1");

    mocks.ensureContext.mockResolvedValue({ decodeAudioData: async () => fakeBuffer });
    const pitch = await applyPitchShift(url1!, 1, cache);
    expect(pitch).not.toBe(url1);
    expect(cache.url).toBeNull();
    expect(cache.key).toBeNull();

    mocks.renderTracksToUrl.mockResolvedValue("blob:render2");
    const url2 = await renderTracksCached(tracksFixture, 120, undefined, [], undefined, cache);
    expect(url2).toBe("blob:render2");
    expect(mocks.renderTracksToUrl).toHaveBeenCalledTimes(2);
  });

  it("returns the cached URL for identical keys without re-rendering", async () => {
    mocks.renderTracksToUrl.mockResolvedValue("blob:cached");

    const cache: RenderCache = { key: null, url: null };
    const a = await renderTracksCached(tracksFixture, 120, undefined, [], undefined, cache);
    const b = await renderTracksCached(tracksFixture, 120, undefined, [], undefined, cache);
    expect(a).toBe("blob:cached");
    expect(b).toBe("blob:cached");
    expect(mocks.renderTracksToUrl).toHaveBeenCalledTimes(1);
  });
});

describe("M12 — transport lock serializes concurrent transport actions", () => {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  it("runs concurrent toggles sequentially (never concurrently)", async () => {
    const lock = createTransportLock();
    let inFlight = 0;
    let maxConcurrent = 0;
    const action = vi.fn(async () => {
      inFlight++;
      maxConcurrent = Math.max(maxConcurrent, inFlight);
      await sleep(10);
      inFlight--;
    });

    await Promise.all([lock.run(action), lock.run(action)]);

    expect(action).toHaveBeenCalledTimes(2);
    expect(maxConcurrent).toBe(1);
  });

  it("skips queued actions once disposed", async () => {
    const lock = createTransportLock();
    lock.dispose();
    const action = vi.fn(async () => {});
    await lock.run(action);
    expect(action).not.toHaveBeenCalled();
  });
});
