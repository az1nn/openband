import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreativePreviewPlayer } from "../../src/components/CreativePreviewPlayer";

describe("CreativePreviewPlayer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fires onPlay when play is pressed and a cacheKey is present", () => {
    const onPlay = vi.fn();
    render(
      <CreativePreviewPlayer
        cacheKey="abc123def456"
        status="stopped"
        onPlay={onPlay}
        onStop={vi.fn()}
        budgetBars={4}
      />,
    );
    fireEvent.click(screen.getByTestId("preview-play"));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("fires onStop when stop is pressed while playing", () => {
    const onStop = vi.fn();
    render(
      <CreativePreviewPlayer
        cacheKey="abc123def456"
        status="playing"
        onPlay={vi.fn()}
        onStop={onStop}
        budgetBars={4}
      />,
    );
    fireEvent.click(screen.getByTestId("preview-stop"));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("disables the play button when cacheKey is null", () => {
    const onPlay = vi.fn();
    render(
      <CreativePreviewPlayer
        cacheKey={null}
        status="stopped"
        onPlay={onPlay}
        onStop={vi.fn()}
        budgetBars={4}
      />,
    );
    const play = screen.getByTestId("preview-play");
    fireEvent.click(play);
    expect(onPlay).not.toHaveBeenCalled();
  });
});
