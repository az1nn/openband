import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { MpcPadGrid } from "../src/components";

describe("MpcPadGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 16 pads by default", () => {
    render(<MpcPadGrid />);
    expect(screen.getByTestId("pad-0")).toBeTruthy();
    expect(screen.getByTestId("pad-15")).toBeTruthy();
  });

  it("renders the configured number of pads", () => {
    render(<MpcPadGrid pads={8} />);
    expect(screen.getByTestId("pad-0")).toBeTruthy();
    expect(screen.getByTestId("pad-7")).toBeTruthy();
    expect(screen.queryByTestId("pad-8")).toBeNull();
  });

  it("fires onPadDown with index, note and positive velocity on press", () => {
    const onPadDown = vi.fn();
    render(<MpcPadGrid baseNote={36} onPadDown={onPadDown} />);
    fireEvent.pointerDown(screen.getByTestId("pad-3"));
    expect(onPadDown).toHaveBeenCalledTimes(1);
    const [idx, vel, note] = onPadDown.mock.calls[0];
    expect(idx).toBe(3);
    expect(note).toBe(39);
    expect(vel).toBeGreaterThan(0);
  });

  it("uses the velocity prop when pressure is unavailable", () => {
    const onPadDown = vi.fn();
    render(<MpcPadGrid velocity={80} onPadDown={onPadDown} />);
    fireEvent.pointerDown(screen.getByTestId("pad-0"));
    expect(onPadDown.mock.calls[0][1]).toBe(80);
  });

  it("reflects pressure-based velocity (clamped 1..127)", () => {
    const onPadDown = vi.fn();
    const { container } = render(<MpcPadGrid onPadDown={onPadDown} />);
    fireEvent.pointerDown(within(container).getByTestId("pad-0"), { pressure: 1 });
    expect(onPadDown.mock.calls[0][1]).toBe(127);

    const onPadDown2 = vi.fn();
    const { container: c2 } = render(<MpcPadGrid onPadDown={onPadDown2} />);
    fireEvent.pointerDown(within(c2).getByTestId("pad-0"), { pressure: 0.5 });
    expect(onPadDown2.mock.calls[0][1]).toBe(64);

    const onPadDown3 = vi.fn();
    const { container: c3 } = render(<MpcPadGrid onPadDown={onPadDown3} />);
    fireEvent.pointerDown(within(c3).getByTestId("pad-0"), { pressure: 0.0079 });
    expect(onPadDown3.mock.calls[0][1]).toBe(1);
  });

  it("fires onPadUp on release", () => {
    const onPadUp = vi.fn();
    render(<MpcPadGrid onPadUp={onPadUp} />);
    const pad = screen.getByTestId("pad-2");
    fireEvent.pointerDown(pad);
    fireEvent.pointerUp(pad);
    expect(onPadUp).toHaveBeenCalledTimes(1);
    expect(onPadUp.mock.calls[0][0]).toBe(2);
    expect(onPadUp.mock.calls[0][1]).toBe(38);
  });

  it("marks a pad active while held", () => {
    render(<MpcPadGrid />);
    const pad = screen.getByTestId("pad-1") as HTMLElement;
    fireEvent.pointerDown(pad);
    expect(pad.getAttribute("aria-pressed")).toBe("true");
    fireEvent.pointerUp(pad);
    expect(pad.getAttribute("aria-pressed")).toBe("false");
  });

  it("fires onPadDown/onPadUp via keyboard mapping", () => {
    const onPadDown = vi.fn();
    const onPadUp = vi.fn();
    render(<MpcPadGrid onPadDown={onPadDown} onPadUp={onPadUp} />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "q" }));
    });
    expect(onPadDown).toHaveBeenCalledTimes(1);
    expect(onPadDown.mock.calls[0][0]).toBe(4);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "q" }));
    });
    expect(onPadUp).toHaveBeenCalledTimes(1);
    expect(onPadUp.mock.calls[0][0]).toBe(4);
  });

  it("ignores keyboard auto-repeat", () => {
    const onPadDown = vi.fn();
    render(<MpcPadGrid onPadDown={onPadDown} />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1", repeat: true }));
    });
    expect(onPadDown).toHaveBeenCalledTimes(1);
  });

  it("does not bind keyboard when enableKeyboard is false", () => {
    const onPadDown = vi.fn();
    render(<MpcPadGrid enableKeyboard={false} onPadDown={onPadDown} />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "1" }));
    });
    expect(onPadDown).not.toHaveBeenCalled();
  });
});
