import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => ({
  saveProject: vi.fn(),
  loadProject: vi.fn(() => null),
}));

vi.mock("react-native", () => ({
  Platform: { OS: "web" },
  Alert: { alert: vi.fn() },
}));
vi.mock("expo-router", () => ({ useLocalSearchParams: vi.fn(() => ({})) }));
vi.mock("expo-audio", () => ({ AudioModule: {}, setAudioModeAsync: vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));
vi.mock("../src/lib/projectStore", () => ({
  saveProject: store.saveProject,
  loadProject: store.loadProject,
}));
vi.mock("../src/lib/midiSynth", () => ({
  renderTracksToUrl: vi.fn(),
  disposeAudioContext: vi.fn(),
  getProjectDurationSeconds: vi.fn(() => 0),
}));
vi.mock("../src/lib/universalAudio", () => ({
  audioSystem: {},
  createTrackedBlob: vi.fn(),
  markBlobActive: vi.fn(),
  revokeTrackedBlob: vi.fn(),
}));
vi.mock("../src/lib/clockManager", () => ({
  startClock: vi.fn(),
  stopClock: vi.fn(),
  onClockTick: vi.fn(),
  disposeClockManager: vi.fn(),
}));
vi.mock("../src/lib/audioTelemetry", () => ({
  startTelemetry: vi.fn(),
  stopTelemetry: vi.fn(),
  sendTelemetryReport: vi.fn(),
  recordFrame: vi.fn(),
  recordCpuLoad: vi.fn(),
}));
vi.mock("../src/lib/timeStretch", () => ({ pitchShift: vi.fn() }));
vi.mock("../src/lib/audio", () => ({ audioBufferToWavBlob: vi.fn() }));

import { useStudioPersistence } from "../app/studio/hooks";

const snapshot = {
  title: "Project",
  tracks: [],
  groups: [],
  buses: [],
  trackAssignments: {},
  masterPlugins: [],
  masteringChain: [],
  sendBuses: [],
  trackAmpChains: {},
  mixSnapshots: [],
  metronome: {},
  recordSettings: {},
} as any;

describe("Studio persistence status", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    store.saveProject.mockReset().mockReturnValue(true);
    store.loadProject.mockReset().mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports manual save success only when projectStore succeeds", () => {
    const { result } = renderHook(() =>
      useStudioPersistence({ id: "p1", snapshot, hydrate: vi.fn() }),
    );
    act(() => result.current.handleManualSave());
    expect(result.current.lastSavedLabel).toBe("Saved ✓");
  });

  it("reports manual save failure instead of Saved", () => {
    store.saveProject.mockReturnValue(false);
    const { result } = renderHook(() =>
      useStudioPersistence({ id: "p1", snapshot, hydrate: vi.fn() }),
    );
    act(() => result.current.handleManualSave());
    expect(result.current.lastSavedLabel).toBe("Save failed");
  });

  it("reports autosave failure instead of Saved", () => {
    store.saveProject.mockReturnValue(false);
    const { result } = renderHook(() =>
      useStudioPersistence({ id: "p1", snapshot, hydrate: vi.fn() }),
    );
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.lastSavedLabel).toBe("Save failed");
  });

  it("flushes the latest snapshot on pagehide", () => {
    renderHook(() => useStudioPersistence({ id: "p1", snapshot, hydrate: vi.fn() }));
    store.saveProject.mockClear();
    act(() => window.dispatchEvent(new Event("pagehide")));
    expect(store.saveProject).toHaveBeenCalledTimes(1);
  });
});
