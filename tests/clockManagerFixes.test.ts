import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Platform } from "react-native";

const hoisted = vi.hoisted(() => {
  const mockCtx = { currentTime: 0 };
  return { mockCtx };
});

vi.mock("../src/lib/universalAudio", () => ({
  getSharedAudioContext: vi.fn(() => hoisted.mockCtx),
}));

class MockWorker {
  onmessage: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  private id: any = null;
  postMessage(d: any) {
    if (d.type === "start") {
      this.id = setInterval(() => {
        this.onmessage?.({ data: { type: "tick", time: performance.now() } });
      }, d.interval || 25);
    } else if (d.type === "stop") {
      clearInterval(this.id);
    }
  }
  terminate() {
    clearInterval(this.id);
  }
}

const tickModules = async () => {
  return import("../src/lib/clockManager");
};

describe("ClockManager native fallback (H3)", () => {
  let origOS: string;

  beforeEach(() => {
    origOS = Platform.OS;
    vi.useFakeTimers();
  });

  afterEach(async () => {
    const m = await tickModules();
    m.stopClock();
    m.disposeClockManager();
    (Platform as any).OS = origOS;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("native (ios) startClock fires onClockTick via setInterval", async () => {
    (Platform as any).OS = "ios";
    const { startClock, onClockTick } = await tickModules();

    let ticks = 0;
    const unsub = onClockTick(() => {
      ticks++;
    });

    startClock(25);
    vi.advanceTimersByTime(100);

    expect(ticks).toBeGreaterThan(0);
    unsub();
  });

  it("native (android) startClock fires onClockTick via setInterval", async () => {
    (Platform as any).OS = "android";
    const { startClock, onClockTick } = await tickModules();

    let ticks = 0;
    const unsub = onClockTick(() => {
      ticks++;
    });

    startClock(25);
    vi.advanceTimersByTime(75);

    expect(ticks).toBeGreaterThan(0);
    unsub();
  });

  it("stopClock stops ticking (no further ticks after stop)", async () => {
    (Platform as any).OS = "ios";
    const { startClock, stopClock, onClockTick } = await tickModules();

    let ticks = 0;
    const unsub = onClockTick(() => {
      ticks++;
    });

    startClock(25);
    vi.advanceTimersByTime(50);
    const ticksBeforeStop = ticks;

    stopClock();
    vi.advanceTimersByTime(200);
    const ticksAfterStop = ticks;

    expect(ticksBeforeStop).toBeGreaterThan(0);
    expect(ticksAfterStop).toBe(ticksBeforeStop);
    unsub();
  });

  it("guards against double-start on native", async () => {
    (Platform as any).OS = "ios";
    const { startClock, stopClock, isClockRunning } = await tickModules();
    const { onClockTick } = await tickModules();

    let ticks = 0;
    const unsub = onClockTick(() => {
      ticks++;
    });

    startClock(25);
    startClock(25);
    expect(isClockRunning()).toBe(true);

    vi.advanceTimersByTime(50);
    stopClock();
    unsub();
  });
});

describe("ClockManager web path still uses AudioContext", () => {
  let origOS: string;
  let getCtxSpy: any;

  beforeEach(async () => {
    origOS = Platform.OS;
    (Platform as any).OS = "web";
    vi.useFakeTimers();
    vi.stubGlobal("Worker", MockWorker as any);
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
    const universalAudio = await import("../src/lib/universalAudio");
    getCtxSpy = universalAudio.getSharedAudioContext;
  });

  afterEach(async () => {
    const m = await tickModules();
    m.stopClock();
    m.disposeClockManager();
    (Platform as any).OS = origOS;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("web startClock consults the shared AudioContext and dispatches ticks with ctx.currentTime", async () => {
    const { startClock, onClockTick } = await tickModules();

    let lastAudioTime = -1;
    let ticks = 0;
    const unsub = onClockTick((_time, audioTime) => {
      ticks++;
      lastAudioTime = audioTime;
    });

    startClock(25);

    expect(getCtxSpy).toHaveBeenCalled();
    vi.advanceTimersByTime(100);

    expect(ticks).toBeGreaterThan(0);
    expect(lastAudioTime).toBe(hoisted.mockCtx.currentTime);
    unsub();
  });
});

describe("ClockManager rAF fallback timebase fix (H3)", () => {
  let origOS: string;
  let getCtxSpy: any;

  beforeEach(async () => {
    origOS = Platform.OS;
    (Platform as any).OS = "web";
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        "Date",
      ],
    });
    vi.stubGlobal(
      "Worker",
      class {
        constructor() {
          throw new Error("worker disabled for rAF fallback test");
        }
        postMessage() {}
        terminate() {}
      },
    );
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
    const universalAudio = await import("../src/lib/universalAudio");
    getCtxSpy = universalAudio.getSharedAudioContext;
    getCtxSpy.mockImplementation(() => null);
  });

  afterEach(async () => {
    getCtxSpy.mockImplementation(() => hoisted.mockCtx);
    const m = await tickModules();
    m.stopClock();
    m.disposeClockManager();
    (Platform as any).OS = origOS;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("web rAF fallback fires onClockTick after the timebase fix", async () => {
    const { startClock, onClockTick } = await tickModules();

    let ticks = 0;
    const unsub = onClockTick(() => {
      ticks++;
    });

    startClock(25);
    vi.advanceTimersByTime(200);

    expect(getCtxSpy).toHaveBeenCalled();
    expect(ticks).toBeGreaterThan(0);
    unsub();
  });
});
