import { describe, expect, it, vi, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Linking } from "react-native";
import {
  OPENBAND_SOURCE_URL,
  WebLaunchLanding,
} from "../src/components/WebLaunchLanding";

describe("WebLaunchLanding", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the release promise, alpha status, and proof row", () => {
    render(<WebLaunchLanding onStartCreating={vi.fn()} />);

    expect(screen.getByText("Make music. Keep the project.")).toBeTruthy();
    expect(screen.getByText("Web alpha")).toBeTruthy();
    expect(screen.getByText("Local-first projects")).toBeTruthy();
    expect(screen.getByText("Free core creation")).toBeTruthy();
    expect(screen.getByText("Open source")).toBeTruthy();
  });

  it("dispatches the creation CTA through the supplied existing-flow callback", () => {
    const onStartCreating = vi.fn();
    render(<WebLaunchLanding onStartCreating={onStartCreating} />);

    fireEvent.click(screen.getByTestId("launch-start-creating"));
    expect(onStartCreating).toHaveBeenCalledTimes(1);
  });

  it("opens the canonical repository from the source CTA", () => {
    const openURL = vi.spyOn(Linking, "openURL").mockResolvedValue(undefined as never);
    render(<WebLaunchLanding onStartCreating={vi.fn()} />);

    fireEvent.click(screen.getByTestId("launch-view-source"));
    expect(openURL).toHaveBeenCalledWith(OPENBAND_SOURCE_URL);
  });
});
