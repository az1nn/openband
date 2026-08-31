import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreativeVariationSwitcher } from "../../src/components/CreativeVariationSwitcher";

const variations = [
  { variationId: "v1", musicalContentHash: "aaa111" },
  { variationId: "v2", musicalContentHash: "bbb222" },
  { variationId: "v3", musicalContentHash: "ccc333" },
  { variationId: "v4", musicalContentHash: "ddd444" },
  { variationId: "v5", musicalContentHash: "eee555" },
];

describe("CreativeVariationSwitcher", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders up to visibleCount variation chips and fires onSelect", () => {
    const onSelect = vi.fn();
    render(
      <CreativeVariationSwitcher
        variations={variations}
        selectedId={null}
        onSelect={onSelect}
        visibleCount={3}
      />,
    );
    expect(screen.getByTestId("variation-chip-v1")).toBeTruthy();
    expect(screen.getByTestId("variation-chip-v3")).toBeTruthy();
    expect(screen.queryByTestId("variation-chip-v4")).toBeNull();
    fireEvent.click(screen.getByTestId("variation-chip-v2"));
    expect(onSelect).toHaveBeenCalledWith("v2");
  });

  it("shows a +N overflow indicator when there are more than visibleCount", () => {
    render(
      <CreativeVariationSwitcher
        variations={variations}
        selectedId={null}
        onSelect={vi.fn()}
        visibleCount={3}
      />,
    );
    const more = screen.getByTestId("variation-more");
    expect(more).toBeTruthy();
    expect(screen.getByText("+2")).toBeTruthy();
  });

  it("does not show overflow indicator when within visibleCount", () => {
    render(
      <CreativeVariationSwitcher
        variations={variations.slice(0, 2)}
        selectedId={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("variation-more")).toBeNull();
  });
});
