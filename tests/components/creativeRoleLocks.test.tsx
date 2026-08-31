import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreativeRoleLocks } from "../../src/components/CreativeRoleLocks";

describe("CreativeRoleLocks", () => {
  beforeEach(() => vi.clearAllMocks());

  const roles = ["rhythm", "bass", "harmony"] as const;

  it("renders a toggle per role and fires onToggle with the role", () => {
    const onToggle = vi.fn();
    render(<CreativeRoleLocks roles={[...roles]} locks={{}} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId("role-toggle-bass"));
    expect(onToggle).toHaveBeenCalledWith("bass");
  });

  it("marks locked roles with an active indicator", () => {
    render(<CreativeRoleLocks roles={[...roles]} locks={{ bass: true }} onToggle={vi.fn()} />);
    const indicator = screen.getByTestId("role-locked-bass");
    expect(indicator).toBeTruthy();
  });

  it("shows a warning badge for incompatible roles", () => {
    render(
      <CreativeRoleLocks
        roles={[...roles]}
        locks={{ bass: false }}
        onToggle={vi.fn()}
        incompatible={["bass"]}
      />,
    );
    expect(screen.getByTestId("role-warning-bass")).toBeTruthy();
  });
});
