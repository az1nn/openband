import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreativeRecipeControls, type CreativeRecipe } from "../../src/components/CreativeRecipeControls";
import { GENRES } from "../../src/lib/projectTemplates";

const baseRecipe: CreativeRecipe = {
  genreId: "rock",
  mood: "dark",
  bpm: 120,
  key: "C",
  timeSignature: "4/4",
  numBars: 8,
  seed: "rock",
};

describe("CreativeRecipeControls", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders genre chips and fires onChange with genreId", () => {
    const onChange = vi.fn();
    render(<CreativeRecipeControls recipe={baseRecipe} onChange={onChange} genres={GENRES} />);
    fireEvent.click(screen.getByTestId("genre-chip-pop"));
    expect(onChange).toHaveBeenCalledWith({ genreId: "pop" });
  });

  it("increments bpm by 5 on bpm-plus", () => {
    const onChange = vi.fn();
    render(<CreativeRecipeControls recipe={baseRecipe} onChange={onChange} genres={GENRES} />);
    fireEvent.click(screen.getByTestId("bpm-plus"));
    expect(onChange).toHaveBeenCalledWith({ bpm: 125 });
  });

  it("decrements numBars by 2 and clamps at 1 on numbars-minus", () => {
    const onChange = vi.fn();
    render(<CreativeRecipeControls recipe={{ ...baseRecipe, numBars: 1 }} onChange={onChange} genres={GENRES} />);
    fireEvent.click(screen.getByTestId("numbars-minus"));
    expect(onChange).toHaveBeenCalledWith({ numBars: 1 });
  });

  it("fires onChange with timeSignature when a ts chip is pressed", () => {
    const onChange = vi.fn();
    render(<CreativeRecipeControls recipe={baseRecipe} onChange={onChange} genres={GENRES} />);
    fireEvent.click(screen.getByTestId("ts-chip-3/4"));
    expect(onChange).toHaveBeenCalledWith({ timeSignature: "3/4" });
  });

  it("fires onChange with key when a key chip is pressed", () => {
    const onChange = vi.fn();
    render(<CreativeRecipeControls recipe={baseRecipe} onChange={onChange} genres={GENRES} />);
    fireEvent.click(screen.getByTestId("key-chip-Am"));
    expect(onChange).toHaveBeenCalledWith({ key: "Am" });
  });
});
