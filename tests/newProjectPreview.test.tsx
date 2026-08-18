import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { NewProject } from "../src/components/NewProject";

vi.mock("../src/lib/projectPreview", async (orig) => {
  const mod = (await orig()) as Record<string, unknown>;
  return {
    ...mod,
    generatePreviewTracks: vi.fn(() => []),
  };
});

vi.mock("../src/lib/midiSynth", async (orig) => {
  const mod = (await orig()) as Record<string, unknown>;
  return {
    ...mod,
    renderTracksToUrl: vi.fn(async () => "blob:test-integration"),
  };
});

const ROCK_GENRE = {
  id: "rock",
  name: "Rock",
  icon: "🎸",
  description: "Rock",
  defaultBpm: 120,
  defaultKey: "Am",
  bpmRange: [80, 180] as [number, number],
  suggestedTracks: [],
  color: "bg-red-500",
};

describe("NewProject preview integration", () => {
  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    onCreate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render preview player on genre step", () => {
    const { queryByTestId } = render(<NewProject {...defaultProps} />);
    expect(queryByTestId("project-preview-player")).toBeNull();
  });

  it("does not render preview player on mood step", () => {
    const { getAllByText, queryByTestId } = render(
      <NewProject {...defaultProps} initialGenre={ROCK_GENRE} />,
    );
    // Click the genre card "Rock" (second occurrence, first is the header)
    const rockButtons = getAllByText("Rock");
    fireEvent.click(rockButtons[rockButtons.length - 1]);
    expect(queryByTestId("project-preview-player")).toBeNull();
  });

  it("renders preview player on details step after selecting mood", () => {
    const { queryByTestId } = render(
      <NewProject
        {...defaultProps}
        initialGenre={ROCK_GENRE}
        initialMood="dark"
      />,
    );
    expect(queryByTestId("project-preview-player")).toBeTruthy();
  });

  it("calls onCreate when create is pressed", () => {
    const onCreate = vi.fn();
    const { getByText } = render(
      <NewProject
        {...defaultProps}
        onCreate={onCreate}
        initialGenre={ROCK_GENRE}
        initialMood="dark"
      />,
    );
    fireEvent.click(getByText(/Criar Projeto/i));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is pressed", () => {
    const onClose = vi.fn();
    const { getByText } = render(
      <NewProject
        {...defaultProps}
        onClose={onClose}
        initialGenre={ROCK_GENRE}
        initialMood="dark"
      />,
    );
    fireEvent.click(getByText("✕"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
