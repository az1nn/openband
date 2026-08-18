import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ProjectPreviewPlayer } from "../../src/components/ProjectPreviewPlayer";
import type { UseProjectPreviewReturn } from "../../src/hooks/useProjectPreview";

function makePreview(overrides: Partial<UseProjectPreviewReturn> = {}): UseProjectPreviewReturn {
  return {
    status: "idle",
    isPlaying: false,
    isRendering: false,
    errorMessage: null,
    previewUrl: null,
    togglePlay: vi.fn().mockResolvedValue(undefined),
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    retry: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("ProjectPreviewPlayer", () => {
  it("renders idle state with play button", () => {
    const preview = makePreview();
    const { getByTestId } = render(<ProjectPreviewPlayer preview={preview} />);
    expect(getByTestId("project-preview-play-btn")).toBeTruthy();
    expect(getByTestId("project-preview-status")).toBeTruthy();
  });

  it("calls togglePlay on button click", () => {
    const togglePlay = vi.fn().mockResolvedValue(undefined);
    const preview = makePreview({ togglePlay });
    const { getByTestId } = render(<ProjectPreviewPlayer preview={preview} />);
    fireEvent.click(getByTestId("project-preview-play-btn"));
    expect(togglePlay).toHaveBeenCalledTimes(1);
  });

  it("disables button when rendering", () => {
    const preview = makePreview({ isRendering: true, status: "rendering" });
    const { getByTestId } = render(<ProjectPreviewPlayer preview={preview} />);
    const btn = getByTestId("project-preview-play-btn");
    expect(btn).toHaveProperty("disabled", true);
  });

  it("disables button when parent disabled prop is true", () => {
    const preview = makePreview();
    const { getByTestId } = render(<ProjectPreviewPlayer preview={preview} disabled />);
    const btn = getByTestId("project-preview-play-btn");
    expect(btn).toHaveProperty("disabled", true);
  });

  it("shows error status text and retry button on error", () => {
    const retry = vi.fn().mockResolvedValue(undefined);
    const preview = makePreview({
      status: "error",
      errorMessage: "Falha ao renderizar",
      retry,
    });
    const { getByTestId } = render(<ProjectPreviewPlayer preview={preview} />);
    expect(getByTestId("project-preview-status").textContent).toContain("Erro");
    const retryBtn = getByTestId("project-preview-retry-btn");
    expect(retryBtn).toBeTruthy();
    fireEvent.click(retryBtn);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("does not show retry button when not in error state", () => {
    const preview = makePreview({ status: "ready" });
    const { queryByTestId } = render(<ProjectPreviewPlayer preview={preview} />);
    expect(queryByTestId("project-preview-retry-btn")).toBeNull();
  });
});
