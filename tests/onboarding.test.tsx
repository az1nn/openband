import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Text } from "react-native";
import {
  getOnboardingState,
  setOnboardingCompleted,
} from "../src/lib/projectStore";
import { OnboardingFlow } from "../src/components/OnboardingFlow";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import {
  buildFirstRunStudioRoute,
  FIRST_RUN_ACTIONS,
  type FirstRunAction,
} from "../src/lib/firstRun";

const ONBOARDING_KEY = "openband_onboarding";

vi.mock("../src/context/AuthContext", async (importOriginal) => {
  return await importOriginal();
});

vi.mock("../src/lib/supabase", () => {
  const supabase = {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signOut: vi.fn(),
    },
  };
  return { supabase, getSupabase: async () => supabase };
});

beforeEach(() => {
  localStorage.clear();
});

describe("Onboarding persistence (projectStore)", () => {
  it("defaults to not completed when the flag is absent", () => {
    expect(getOnboardingState().completed).toBe(false);
  });

  it("reports completed after setOnboardingCompleted and persists across reloads", () => {
    setOnboardingCompleted();
    expect(getOnboardingState().completed).toBe(true);
    expect(JSON.parse(localStorage.getItem(ONBOARDING_KEY) || "{}")).toEqual({
      completed: true,
    });
  });
});

describe("OnboardingFlow action-first launch", () => {
  it("is hidden when not visible", () => {
    const { container } = render(
      <OnboardingFlow visible={false} onClose={vi.fn()} onCreate={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows exactly the four launch actions before project configuration", () => {
    render(
      <OnboardingFlow visible onClose={vi.fn()} onCreate={vi.fn()} onAction={vi.fn()} />,
    );
    expect(screen.getByText("O que você quer fazer primeiro?")).toBeTruthy();
    for (const action of FIRST_RUN_ACTIONS) {
      expect(screen.getByTestId(`onboarding-action-${action.id}`)).toBeTruthy();
    }
    expect(screen.queryByText("Novo Projeto")).toBeNull();
  });

  it.each(FIRST_RUN_ACTIONS.map((action) => [action.id, action.studioTool]))(
    "dispatches %s to the intended Studio tool %s",
    (actionId, expectedTool) => {
      const onAction = vi.fn();
      render(
        <OnboardingFlow visible onClose={vi.fn()} onCreate={vi.fn()} onAction={onAction} />,
      );
      fireEvent.click(screen.getByTestId(`onboarding-action-${actionId}`));
      expect(onAction).toHaveBeenCalledWith(actionId as FirstRunAction);
      const route = buildFirstRunStudioRoute(actionId as FirstRunAction);
      const url = new URL(route, "https://openband.local");
      expect(url.searchParams.get("tool")).toBe(expectedTool);
      expect(url.searchParams.get("fromOnboarding")).toBe("1");
      expect(url.searchParams.get("scratch")).toBe("1");
    },
  );

  it("keeps the full project wizard available as a secondary path", () => {
    render(
      <OnboardingFlow visible onClose={vi.fn()} onCreate={vi.fn()} onAction={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId("onboarding-advanced-project"));
    expect(screen.getByText("Novo Projeto")).toBeTruthy();
  });

  it("renders close and don't-show-again controls", () => {
    render(
      <OnboardingFlow visible onClose={vi.fn()} onCreate={vi.fn()} onAction={vi.fn()} />,
    );
    expect(screen.getByTestId("onboarding-close")).toBeTruthy();
    expect(screen.getByText("Não mostrar novamente")).toBeTruthy();
  });

  it("persists don't-show-again only when selected", () => {
    const onClose = vi.fn();
    const onDontShowAgain = vi.fn();
    const { rerender } = render(
      <OnboardingFlow
        visible
        onClose={onClose}
        onCreate={vi.fn()}
        onAction={vi.fn()}
        onDontShowAgain={onDontShowAgain}
      />,
    );
    fireEvent.click(screen.getByTestId("onboarding-close"));
    expect(onDontShowAgain).not.toHaveBeenCalled();

    rerender(
      <OnboardingFlow
        visible
        onClose={onClose}
        onCreate={vi.fn()}
        onAction={vi.fn()}
        onDontShowAgain={onDontShowAgain}
      />,
    );
    fireEvent.click(screen.getByTestId("onboarding-dont-show"));
    fireEvent.click(screen.getByTestId("onboarding-close"));
    expect(onDontShowAgain).toHaveBeenCalledTimes(1);
  });
});

describe("AuthContext onboarding flag", () => {
  function OnboardingProbe() {
    const { hasOnboarded, completeOnboarding } = useAuth();
    return (
      <>
        <Text testID="hasOnboarded">{String(hasOnboarded)}</Text>
        <Text testID="complete" onPress={() => completeOnboarding()}>
complete
        </Text>
      </>
    );
  }

  it("starts not onboarded for a fresh visitor", () => {
    render(
      <AuthProvider>
        <OnboardingProbe />
      </AuthProvider>,
    );
    expect(screen.getByTestId("hasOnboarded").textContent).toBe("false");
  });

  it("flips hasOnboarded and persists after completeOnboarding", async () => {
    render(
      <AuthProvider>
        <OnboardingProbe />
      </AuthProvider>,
    );
    expect(screen.getByTestId("hasOnboarded").textContent).toBe("false");
    fireEvent.click(screen.getByTestId("complete"));
    expect(screen.getByTestId("hasOnboarded").textContent).toBe("true");
    await waitFor(() => {
      expect(getOnboardingState().completed).toBe(true);
    });
  });
});
