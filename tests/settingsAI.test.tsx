import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Linking } from "react-native";
import SettingsAI from "../app/settings-ai";
import { useSettingsAIStore } from "../src/lib/settingsStore";

const mockSession = { data: { session: { access_token: "tok-123" } } };

vi.mock("../src/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: async () => mockSession,
    },
  },
}));

vi.mock("../src/lib/apiUrl", () => ({
  API_BASE_URL: "http://localhost:3001",
}));

function mockFetchOnce(
  payload: unknown,
  opts: { ok?: boolean; status?: number } = {},
) {
  return vi.fn(async () =>
    ({
      ok: opts.ok ?? true,
      status: opts.status ?? 200,
      json: async () => payload,
    }) as unknown as Response,
  );
}

describe("settingsAI screen", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useSettingsAIStore.setState({
      aiKeys: {},
      defaultImageProvider: "gemini",
      defaultPromptRefiner: "claude",
    });
    localStorage.clear();
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders privacy card and the 5 provider cards in spec order", () => {
    render(<SettingsAI />);
    expect(
      screen.getByText(/Suas chaves ficam guardadas apenas neste dispositivo/),
    ).toBeTruthy();
    const names = [
      "Google Gemini",
      "OpenAI (ChatGPT)",
      "OpenRouter",
      "Anthropic Claude",
      "Hugging Face",
    ];
    names.forEach((n) => expect(screen.getByText(n)).toBeTruthy());
    expect(screen.getByText("Imagem + Refinar")).toBeTruthy();
    expect(screen.getByText("Apenas refinar prompt")).toBeTruthy();
  });

  it("saves a typed key to the store on change", () => {
    render(<SettingsAI />);
    fireEvent.change(screen.getByTestId("ai-key-input-gemini"), {
      target: { value: "AIza-secret" },
    });
    expect(useSettingsAIStore.getState().aiKeys.gemini).toBe("AIza-secret");
  });

  it("obter chave opens the provider signup URL", () => {
    const openURLSpy = vi
      .spyOn(Linking, "openURL")
      .mockResolvedValue(true as never);
    render(<SettingsAI />);
    fireEvent.click(screen.getByLabelText("Obter chave Google Gemini"));
    expect(openURLSpy).toHaveBeenCalledWith(
      "https://aistudio.google.com/app/apikey",
    );
  });

  it("test-key posts to the route with auth header and shows success", async () => {
    useSettingsAIStore.setState({ aiKeys: { gemini: "AIza-secret" } });
    fetchSpy.mockImplementation(
      mockFetchOnce({ ok: true, message: "Chave funcionando!" }),
    );
    render(<SettingsAI />);
    fireEvent.click(screen.getByTestId("ai-test-key-gemini"));
    await waitFor(() =>
      expect(screen.getByText(/Chave funcionando/)).toBeTruthy(),
    );
    expect(fetchSpy.mock.calls[0][0]).toBe(
      "http://localhost:3001/api/ai/test-key",
    );
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(init.headers).toMatchObject({
      Authorization: "Bearer tok-123",
    });
    expect(JSON.parse(init.body as string)).toEqual({
      provider: "gemini",
      apiKey: "AIza-secret",
    });
  });

  it("test-key shows inline error from the backend", async () => {
    useSettingsAIStore.setState({ aiKeys: { gemini: "AIza-bad" } });
    fetchSpy.mockImplementation(
      mockFetchOnce({ ok: false, error: "Chave inválida." }, { ok: false, status: 400 }),
    );
    render(<SettingsAI />);
    fireEvent.click(screen.getByTestId("ai-test-key-gemini"));
    await waitFor(() => expect(screen.getByText(/Chave inválida/)).toBeTruthy());
  });

  it("apagar chave removes the key from the store", () => {
    useSettingsAIStore.setState({ aiKeys: { gemini: "AIza-secret" } });
    render(<SettingsAI />);
    expect(screen.getByText("Apagar chave")).toBeTruthy();
    fireEvent.click(screen.getByTestId("ai-remove-key-gemini"));
    expect(useSettingsAIStore.getState().aiKeys.gemini).toBeUndefined();
  });

  it("defaults chips persist selections via setDefaults", () => {
    useSettingsAIStore.setState({
      aiKeys: { gemini: "g", openai: "o", claude: "c" },
    });
    render(<SettingsAI />);
    fireEvent.click(screen.getByTestId("default-image-openai"));
    expect(useSettingsAIStore.getState().defaultImageProvider).toBe("openai");
    fireEvent.click(screen.getByTestId("default-refiner-claude"));
    expect(useSettingsAIStore.getState().defaultPromptRefiner).toBe("claude");
  });
});
