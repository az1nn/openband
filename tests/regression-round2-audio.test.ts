import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  recordCpuLoad,
  getAverageMetrics,
  startTelemetry,
  stopTelemetry,
} from "../src/lib/audioTelemetry";
import {
  detectSampleRate,
  createUnifiedInstrumentEngine,
  INSTRUMENT_PRESETS,
} from "../src/lib/wasmInstrumentEngine";

// ---------------------------------------------------------------------------
// AUDIO TELEMETRY — true peak CPU across the window
// ---------------------------------------------------------------------------
describe("audioTelemetry peakCpu is the true max across the window", () => {
  it("peakCpu reflects the true max (peakCpuTrue), not the last bucket's max", () => {
    vi.useFakeTimers();
    try {
      // Resets ring buffer + peakCpuTrue to 0 and starts the collect timer.
      startTelemetry({ reportIntervalMs: 50 });

      recordCpuLoad(10);
      vi.advanceTimersByTime(50); // bucket max=10, true peak=10

      recordCpuLoad(90);
      vi.advanceTimersByTime(50); // bucket max=90, true peak=90

      recordCpuLoad(30);
      vi.advanceTimersByTime(50); // bucket max=30, true peak stays 90 (NOT reset to 30)

      const m = getAverageMetrics();
      expect(m).not.toBeNull();
      // The fix keeps a separate peakCpuTrue accumulator that only increases,
      // so the dip in the trailing bucket does not lower the reported peak.
      expect(m!.peakCpu).toBe(90);

      stopTelemetry();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// LATENCY MONITOR — re-entrant guard on startDirectMonitor
// ---------------------------------------------------------------------------
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
}

const { mockGetSharedAudioContext } = vi.hoisted(() => ({
  mockGetSharedAudioContext: vi.fn(() => null),
}));

vi.mock("../src/lib/universalAudio", () => ({
  getSharedAudioContext: mockGetSharedAudioContext,
  ensureSharedAudioContext: vi.fn(),
  disposeAllAudio: vi.fn(),
  audioSystem: { audioCtx: null },
}));

const setPlatformWeb = async () => {
  const { Platform } = await import("react-native");
  (Platform as any).OS = "web";
};

describe("latencyMonitor startDirectMonitor re-entrant guard", () => {
  const getUserMediaMock = vi.fn();

  beforeEach(async () => {
    getUserMediaMock.mockReset();
    getUserMediaMock.mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });
    mockGetSharedAudioContext.mockClear();
    vi.stubGlobal("AudioContext", FakeAudioContext as any);
    vi.stubGlobal("navigator", {
      userAgent: "node",
      mediaDevices: {
        getUserMedia: getUserMediaMock,
      },
    });
    await setPlatformWeb();
  });

  afterEach(async () => {
    const { stopDirectMonitor } = await import("../src/lib/latencyMonitor");
    stopDirectMonitor();
    vi.unstubAllGlobals();
  });

  it("calling startDirectMonitor twice opens only one mic stream (second returns early via monitorState.enabled)", async () => {
    const { startDirectMonitor, getMonitorState } = await import("../src/lib/latencyMonitor");

    const state1 = await startDirectMonitor();
    const state2 = await startDirectMonitor();

    // First call acquired the mic; the second call must early-return because
    // monitorState.enabled was already true — so getUserMedia is called once.
    expect(state1.enabled).toBe(true);
    expect(state2.enabled).toBe(true);
    expect(getUserMediaMock).toHaveBeenCalledTimes(1);

    // Stopping must flip the enabled flag back off.
    const { stopDirectMonitor } = await import("../src/lib/latencyMonitor");
    stopDirectMonitor();
    expect(getMonitorState().enabled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// WASM INSTRUMENT ENGINE — sample rate handling
// ---------------------------------------------------------------------------
class MockAudioContextForRate {
  sampleRate: number;
  constructor(sampleRate = 48000) {
    this.sampleRate = sampleRate;
  }
  close = vi.fn().mockResolvedValue(undefined);
}

describe("wasmInstrumentEngine sample rate", () => {
  beforeEach(() => {
    vi.stubGlobal("AudioContext", MockAudioContextForRate as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("detectSampleRate returns a positive number from the probed AudioContext", () => {
    const rate = detectSampleRate();
    expect(typeof rate).toBe("number");
    expect(rate).toBeGreaterThan(0);
    // The stubbed context reports 48000, so the probe must surface it.
    expect(rate).toBe(48000);
  });

  it("createUnifiedInstrumentEngine actually uses the passed sample rate", () => {
    // Module-level engineSampleRate is shared; render A at 48000 first, then
    // create B at 44100 and render it. Because the DSP math (envelope timing,
    // filter coefficient) is driven by the active sample rate, the two rendered
    // buffers must differ — proving the passed rate is propagated (not ignored).
    const a = createUnifiedInstrumentEngine(INSTRUMENT_PRESETS[0], 48000);
    a.noteOn(69, 100);
    const outA = new Float32Array(2000);
    a.render(outA, 2000);

    const b = createUnifiedInstrumentEngine(INSTRUMENT_PRESETS[0], 44100);
    b.noteOn(69, 100);
    const outB = new Float32Array(2000);
    b.render(outB, 2000);

    let differs = false;
    for (let i = 0; i < outA.length; i++) {
      if (outA[i] !== outB[i]) {
        differs = true;
        break;
      }
    }
    expect(differs).toBe(true);
  });
});
