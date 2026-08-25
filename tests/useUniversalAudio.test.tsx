import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  useAudioPlayer: vi.fn(),
  useAudioPlayerStatus: vi.fn(),
  ensureContext: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("expo-audio", () => ({
  useAudioPlayer: (src: unknown) => h.useAudioPlayer(src),
  useAudioPlayerStatus: () => h.useAudioPlayerStatus(),
}));

vi.mock("../lib/universalAudio", () => ({
  audioSystem: { ensureContext: h.ensureContext },
}));

import { useUniversalAudio } from "../src/hooks/useUniversalAudio";

beforeEach(() => {
  h.useAudioPlayer.mockImplementation((src: unknown) => ({
    play: vi.fn(),
    pause: vi.fn(),
    replace: vi.fn(),
    seekTo: vi.fn(),
    volume: 1,
    src,
  }));
  h.useAudioPlayerStatus.mockReturnValue({
    playing: false,
    currentTime: 0,
    duration: 100,
    isLoaded: false,
  });
  h.ensureContext.mockResolvedValue(undefined);
});

describe("useUniversalAudio M6 empty-source sentinel", () => {
  it("passes null (not empty string) for null/undefined/empty source", () => {
    for (const src of [null, undefined, ""]) {
      h.useAudioPlayer.mockClear();
      const { unmount } = renderHook(() => useUniversalAudio(src as never));
      expect(h.useAudioPlayer).toHaveBeenCalledWith(null);
      unmount();
    }
  });

  it("passes a real url through unchanged", () => {
    h.useAudioPlayer.mockClear();
    renderHook(() => useUniversalAudio("https://example.com/a.mp3"));
    expect(h.useAudioPlayer).toHaveBeenCalledWith("https://example.com/a.mp3");
  });

  it("play() does not throw with no source and reports not loaded", async () => {
    const { result } = renderHook(() => useUniversalAudio(null));
    await act(async () => {
      await result.current.play();
    });
    expect(result.current.isLoaded).toBe(false);
  });
});
