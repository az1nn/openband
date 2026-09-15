import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Platform } from "react-native";

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));

vi.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
  Redirect: ({ href }: { href: string }) => <div data-testid="redirect" data-href={href} />,
}));

import Index from "../app/index";

const originalOS = Object.getOwnPropertyDescriptor(Platform, "OS");

describe("root index route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalOS) Object.defineProperty(Platform, "OS", originalOS);
  });

  it("renders the public launch surface on Web and enters the existing login flow", () => {
    Object.defineProperty(Platform, "OS", { get: () => "web", configurable: true });

    render(<Index />);
    expect(screen.getByTestId("web-launch-landing")).toBeTruthy();
    expect(screen.queryByTestId("redirect")).toBeNull();

    fireEvent.click(screen.getByTestId("launch-start-creating"));
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("preserves the existing native root redirect", () => {
    Object.defineProperty(Platform, "OS", { get: () => "ios", configurable: true });

    render(<Index />);
    expect(screen.getByTestId("redirect")).toHaveAttribute("data-href", "/tabs");
  });
});
