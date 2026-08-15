import { describe, it, expect, vi, beforeEach } from "vitest";

function autoMock() {
  return {
    default: vi.fn(),
    RecordingPresets: {},
    AudioModule: { setAudioModeAsync: vi.fn() },
  };
}

vi.mock("expo-audio", autoMock);
vi.mock("../src/lib/midiSynth", autoMock);
vi.mock("../src/lib/universalAudio", autoMock);
vi.mock("../src/lib/assetStore", autoMock);
vi.mock("../src/lib/apiUrl", autoMock);
vi.mock("../src/lib/busRouter", autoMock);
vi.mock("../src/lib/masteringBridge", autoMock);
vi.mock("../src/lib/automationEngine", autoMock);
vi.mock("../src/components", autoMock);
vi.mock("../src/components/TrackGroup", autoMock);
vi.mock("../src/lib/midiLearn", autoMock);
vi.mock("../src/lib/commandRegistry", autoMock);
vi.mock("../src/lib/harmonicAssistant", autoMock);
vi.mock("../src/lib/history", autoMock);
vi.mock("../src/lib/keyboard", autoMock);
vi.mock("../src/lib/projectStore", autoMock);
vi.mock("../src/lib/cloudSync", autoMock);
vi.mock("../src/lib/midiParser", autoMock);
vi.mock("../src/lib/types", autoMock);
vi.mock("../src/lib/responsive", autoMock);
vi.mock("../src/lib/automix", autoMock);
vi.mock("../src/lib/projectTemplates", autoMock);
vi.mock("../src/hooks/useWebAudioPlayer", autoMock);
vi.mock("../src/lib/presence", autoMock);
vi.mock("../src/lib/playheadStore", autoMock);
vi.mock("../app/studio/parts", autoMock);
vi.mock("../app/studio/StudioModals", autoMock);
vi.mock("../app/studio/hooks", autoMock);

import { deriveRecordingUri, RecordingSingleFlight } from "../app/studio/[id].tsx";

describe("Audio recording fixes — M11 single-flight guard", () => {
  let guard: RecordingSingleFlight;

  beforeEach(() => {
    guard = new RecordingSingleFlight();
  });

  it("blocks a second concurrent start (rapid double-tap) and allows one after end", () => {
    const start = vi.fn();

    const invokeToggle = () => {
      if (!guard.begin()) return;
      start();
    };

    invokeToggle();
    invokeToggle();

    expect(start).toHaveBeenCalledTimes(1);

    guard.end();
    invokeToggle();
    expect(start).toHaveBeenCalledTimes(2);
  });

  it("a fresh guard always allows the first begin", () => {
    expect(guard.begin()).toBe(true);
    expect(guard.begin()).toBe(false);
    expect(guard.begin()).toBe(false);
  });
});

describe("Audio recording fixes — M10 stop URI not from stale state", () => {
  it("derives the URI from the recorder instance after stop, ignoring stale React state", () => {
    const recorder = { uri: "file://fresh-recording.m4a" };
    const staleState = { url: null };

    expect(deriveRecordingUri(recorder, staleState)).toBe(
      "file://fresh-recording.m4a",
    );
  });

  it("prefers the recorder instance uri over a stale url in React state", () => {
    const recorder = { uri: "file://fresh.m4a" };
    const staleState = { url: "file://stale.m4a" };

    expect(deriveRecordingUri(recorder, staleState)).toBe("file://fresh.m4a");
  });

  it("falls back to recorderState.url when the recorder uri is empty", () => {
    const recorder = { uri: null };
    const staleState = { url: "file://state.m4a" };

    expect(deriveRecordingUri(recorder, staleState)).toBe("file://state.m4a");
  });

  it("returns empty string when both sources are empty", () => {
    const recorder = { uri: null };
    const staleState = { url: null };

    expect(deriveRecordingUri(recorder, staleState)).toBe("");
  });
});
