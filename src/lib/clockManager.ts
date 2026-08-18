import { Platform } from "react-native";
import { getSharedAudioContext } from "./universalAudio";

type TickListener = (time: number, audioTime: number) => void;

function createWorkerBlob(): string {
  const code = `
let intervalId = null;
self.onmessage = function(e) {
  var type = e.data.type;
  var interval = e.data.interval || 25;
  if (type === "start") {
    if (intervalId !== null) clearInterval(intervalId);
    intervalId = setInterval(function() {
      self.postMessage({ type: "tick", time: performance.now() });
    }, interval);
  } else if (type === "stop") {
    if (intervalId !== null) { clearInterval(intervalId); intervalId = null; }
  } else if (type === "setInterval") {
    if (intervalId !== null) { clearInterval(intervalId); }
    intervalId = setInterval(function() {
      self.postMessage({ type: "tick", time: performance.now() });
    }, interval || 25);
  }
};
`;
  return code;
}

let workerInstance: Worker | null = null;
let workerBlobUrl: string | null = null;
let rafId: number | null = null;
let intervalId: number | null = null;
let isRunning = false;
const listeners = new Set<TickListener>();

function getAudioContext(): AudioContext | null {
  if (Platform.OS !== "web") return null;
  return getSharedAudioContext();
}

function dispatchTick(time: number, audioTime: number): void {
  for (const listener of listeners) {
    try {
      listener(time, audioTime);
    } catch (e) {
      console.warn("Tick listener error:", e);
    }
  }
}

function startWorkerClock(ctx: AudioContext, intervalMs: number): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
    if (workerBlobUrl) {
      URL.revokeObjectURL(workerBlobUrl);
      workerBlobUrl = null;
    }
  }

  try {
    const blob = new Blob([createWorkerBlob()], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    workerBlobUrl = url;
    workerInstance = new Worker(url);

    workerInstance.onmessage = (e: MessageEvent<{ type: string; time: number }>) => {
      if (e.data.type === "tick") {
        dispatchTick(e.data.time, ctx.currentTime);
      }
    };

    workerInstance.onerror = (e) => {
      console.warn("Clock worker error:", e.message);
      if (workerBlobUrl) {
        URL.revokeObjectURL(workerBlobUrl);
        workerBlobUrl = null;
      }
    };

    workerInstance.postMessage({ type: "start", interval: intervalMs });
  } catch (e) {
    console.warn("Failed to start clock worker:", e);
    startFallbackClock(intervalMs);
  }
}

function startFallbackClock(intervalMs: number): void {
  const startTime = Date.now();
  const tick = () => {
    const now = Date.now();
    dispatchTick(now - startTime, now / 1000);
  };

  if (Platform.OS === "web" && typeof requestAnimationFrame !== "undefined") {
    let last = 0;
    const loop = (t: number) => {
      if (rafId === null) return;
      if (last === 0) last = t;
      if (t - last >= intervalMs) {
        last = t;
        tick();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  } else {
    intervalId = setInterval(tick, intervalMs) as unknown as number;
  }
}

export function startClock(intervalMs: number = 25): void {
  if (isRunning) return;

  const ctx = getAudioContext();
  if (ctx && Platform.OS === "web") {
    startWorkerClock(ctx, intervalMs);
  } else {
    startFallbackClock(intervalMs);
  }
  isRunning = true;
}

export function stopClock(): void {
  if (!isRunning) return;
  if (workerInstance) {
    workerInstance.postMessage({ type: "stop" });
    workerInstance.terminate();
    workerInstance = null;
    if (workerBlobUrl) {
      URL.revokeObjectURL(workerBlobUrl);
      workerBlobUrl = null;
    }
  }
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  isRunning = false;
}

export function disposeClockManager(): void {
  stopClock();
  // AudioContext lifecycle is now managed by universalAudio.dispose()
  listeners.clear();
}

export function onClockTick(listener: TickListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isClockRunning(): boolean {
  return isRunning;
}
