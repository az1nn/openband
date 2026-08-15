import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const sharedCloseSpy = vi.fn().mockResolvedValue(undefined);
const sharedCtx: any = {
  state: "running",
  baseLatency: 0.005,
  outputLatency: 0.01,
  destination: {},
  resume: vi.fn().mockResolvedValue(undefined),
  close: sharedCloseSpy,
  createMediaStreamSource: vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() })),
  createGain: vi.fn(() => ({ gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() })),
};

const createdContexts: any[] = [];

class FakeAudioContext {
  state = "running" as AudioContextState;
  baseLatency = 0.005;
  outputLatency = 0.01;
  destination = {};
  closeSpy = vi.fn().mockResolvedValue(undefined);
  resume = vi.fn().mockResolvedValue(undefined);
  createMediaStreamSource = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() }));
  createGain = vi.fn(() => ({ gain: { value: 1 }, connect: vi.fn(), disconnect: vi.fn() }));
  close = () => this.closeSpy();

  constructor() {
    createdContexts.push(this);
  }
}

const mockGetSharedAudioContext = vi.fn(() => sharedCtx);

vi.mock("../src/lib/universalAudio", () => ({
  getSharedAudioContext: mockGetSharedAudioContext,
  ensureSharedAudioContext: vi.fn(),
  disposeAllAudio: vi.fn(),
  audioSystem: { audioCtx: sharedCtx },
}));

const setPlatformWeb = async () => {
  const { Platform } = await import("react-native");
  (Platform as any).OS = "web";
};

describe("Latency Monitor H3 — dedicated monitor context", () => {
  beforeEach(() => {
    createdContexts.length = 0;
    sharedCloseSpy.mockClear();
    mockGetSharedAudioContext.mockClear();
    vi.stubGlobal("AudioContext", FakeAudioContext as any);
    vi.stubGlobal("navigator", {
      userAgent: "node",
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });
  });

  afterEach(async () => {
    const { disposeLatencySystem } = await import("../src/lib/latencyMonitor");
    disposeLatencySystem();
    vi.unstubAllGlobals();
  });

  it("uses a dedicated AudioContext, never the shared singleton, for monitoring", async () => {
    await setPlatformWeb();
    const { startDirectMonitor } = await import("../src/lib/latencyMonitor");

    const state = await startDirectMonitor();

    expect(state.enabled).toBe(true);
    expect(createdContexts.length).toBe(1);
    expect(createdContexts[0]).not.toBe(sharedCtx);
    expect(mockGetSharedAudioContext).not.toHaveBeenCalled();
  });

  it("disposeLatencySystem closes only the dedicated context, never the shared singleton", async () => {
    await setPlatformWeb();
    const { startDirectMonitor, disposeLatencySystem } = await import("../src/lib/latencyMonitor");

    await startDirectMonitor();
    const dedicatedCtx = createdContexts[0];
    expect(dedicatedCtx).toBeDefined();

    disposeLatencySystem();

    expect(dedicatedCtx.closeSpy).toHaveBeenCalled();
    expect(sharedCloseSpy).not.toHaveBeenCalled();
  });
});

describe("Latency Monitor M13 — no false active state on mic failure", () => {
  beforeEach(() => {
    createdContexts.length = 0;
    sharedCloseSpy.mockClear();
    mockGetSharedAudioContext.mockClear();
    vi.stubGlobal("AudioContext", FakeAudioContext as any);
    vi.stubGlobal("navigator", {
      userAgent: "node",
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new Error("Permission denied")),
      },
    });
  });

  afterEach(async () => {
    const { disposeLatencySystem } = await import("../src/lib/latencyMonitor");
    disposeLatencySystem();
    vi.unstubAllGlobals();
  });

  it("returns monitoring disabled (enabled:false) and propagates an error when no mic stream", async () => {
    await setPlatformWeb();
    const { startDirectMonitor } = await import("../src/lib/latencyMonitor");

    const state = await startDirectMonitor();

    expect(state.enabled).toBe(false);
    expect(state.error).toBeTruthy();
    expect(createdContexts.length).toBe(0);
    expect(mockGetSharedAudioContext).not.toHaveBeenCalled();
  });
});
