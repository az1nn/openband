import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProjectPreview } from "../src/hooks/useProjectPreview";
import * as midiSynth from "../src/lib/midiSynth";
import * as universalAudio from "../src/lib/universalAudio";

describe("useProjectPreview hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("starts in idle status without rendering upfront", () => {
    const renderSpy = vi.spyOn(midiSynth, "renderTracksToUrl").mockResolvedValue("blob:test-1");

    const { result } = renderHook(() =>
      useProjectPreview({
        genreId: "rock",
        bpm: 120,
        key: "Am",
        timeSignature: "4/4",
        numBars: 8,
      }),
    );

    expect(result.current.status).toBe("idle");
    expect(result.current.isRendering).toBe(false);
    expect(renderSpy).not.toHaveBeenCalled();
  });

  it("renders on explicit togglePlay call", async () => {
    const renderSpy = vi.spyOn(midiSynth, "renderTracksToUrl").mockResolvedValue("blob:test-1");

    const { result } = renderHook(() =>
      useProjectPreview({
        genreId: "rock",
        bpm: 120,
        key: "Am",
        timeSignature: "4/4",
        numBars: 8,
      }),
    );

    await act(async () => {
      await result.current.togglePlay();
    });

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(result.current.previewUrl).toBe("blob:test-1");
  });

  it("debounces rapid config changes after activation and renders latest config only", async () => {
    let callCount = 0;
    const renderSpy = vi.spyOn(midiSynth, "renderTracksToUrl").mockImplementation(async () => {
      callCount++;
      return `blob:test-${callCount}`;
    });

    const { result, rerender } = renderHook(
      (props) => useProjectPreview(props, { debounceMs: 100 }),
      {
        initialProps: {
          genreId: "rock",
          bpm: 120,
          key: "Am",
          timeSignature: "4/4",
          numBars: 8,
        },
      },
    );

    // Initial activation
    await act(async () => {
      await result.current.togglePlay();
    });
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Rapid 5 BPM changes
    for (let bpm = 121; bpm <= 125; bpm++) {
      rerender({
        genreId: "rock",
        bpm,
        key: "Am",
        timeSignature: "4/4",
        numBars: 8,
      });
      vi.advanceTimersByTime(20);
    }

    // Flush debounce timer
    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    // Exactly 1 additional render for the 5 rapid changes
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  it("cleans up active blob URL on unmount", async () => {
    vi.spyOn(midiSynth, "renderTracksToUrl").mockResolvedValue("blob:test-unmount");
    const revokeSpy = vi.spyOn(universalAudio, "revokeTrackedBlob");

    const { result, unmount } = renderHook(() =>
      useProjectPreview({
        genreId: "pop",
        bpm: 100,
        key: "C",
        timeSignature: "4/4",
        numBars: 8,
      }),
    );

    await act(async () => {
      await result.current.togglePlay();
    });

    unmount();

    expect(revokeSpy).toHaveBeenCalledWith("blob:test-unmount");
  });

  it("handles render errors gracefully and sets error status", async () => {
    vi.spyOn(midiSynth, "renderTracksToUrl").mockRejectedValue(new Error("Audio render failed"));

    const { result } = renderHook(() =>
      useProjectPreview({
        genreId: "electronic",
        bpm: 128,
        key: "Fm",
        timeSignature: "4/4",
        numBars: 8,
      }),
    );

    await act(async () => {
      await result.current.togglePlay();
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe("Audio render failed");
  });
});
