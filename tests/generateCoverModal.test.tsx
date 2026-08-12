import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  GenerateCoverModal,
  sanitizeCoverFilename,
} from "../src/components/GenerateCoverModal";
import { useSettingsAIStore } from "../src/lib/settingsStore";

const mockSession = { data: { session: { access_token: "tok-123" } } };

vi.mock("../src/lib/supabase", () => {
  const supabase = {
    auth: {
      getSession: async () => mockSession,
    },
  };
  return { supabase, getSupabase: async () => supabase };
});

vi.mock("../src/lib/apiUrl", () => ({
  API_BASE_URL: "http://localhost:3001",
}));

function renderModal(props: Partial<React.ComponentProps<typeof GenerateCoverModal>> = {}) {
  return render(
    <GenerateCoverModal
      visible
      onClose={vi.fn()}
      projectTitle="Minha Música"
      onUseAsCover={vi.fn()}
      {...props}
    />,
  );
}

describe("GenerateCoverModal", () => {
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

  it("shows the no-keys warning state when no provider has a key", () => {
    renderModal();
    expect(screen.getByText("Configure sua chave de IA primeiro")).toBeTruthy();
    expect(screen.getByText("Configurar chaves")).toBeTruthy();
  });

  it("hides providers without a key from the image selector", () => {
    useSettingsAIStore.setState({ aiKeys: { openai: "sk-1" } });
    renderModal();
    expect(screen.getAllByText("OpenAI (ChatGPT)").length).toBeGreaterThan(0);
    expect(screen.queryByText("Google Gemini")).toBeNull();
  });

  it("refines the lyrics via /refine-prompt and fills the editable prompt", async () => {
    useSettingsAIStore.setState({
      aiKeys: { claude: "sk-ant", gemini: "AIza-secret" },
    });
    fetchSpy.mockImplementation(async (url) => {
      if (String(url).includes("/refine-prompt")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            refined:
              "A cinematic album cover, moody neon-lit forest, teal and violet palette, volumetric fog, emotional",
          }),
        } as unknown as Response;
      }
      return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
    });
    renderModal({ lyrics: "Corre pela estrada escura" });
    fireEvent.click(screen.getByText("✨ Deixar profissional"));
    await waitFor(() =>
      expect(
        screen.getByDisplayValue(/A cinematic album cover/),
      ).toBeTruthy(),
    );
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.provider).toBe("claude");
    expect(body.lyrics).toBe("Corre pela estrada escura");
    expect(init.headers).toMatchObject({ Authorization: "Bearer tok-123" });
  });

  it("generates a cover and fires onUseAsCover with the data URL", async () => {
    useSettingsAIStore.setState({ aiKeys: { gemini: "AIza-secret" } });
    const onUseAsCover = vi.fn();
    fetchSpy.mockImplementation(async (url) => {
      if (String(url).includes("/generate-cover")) {
        return {
          ok: true,
          status: 200,
          blob: async () => new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }),
        } as unknown as Response;
      }
      return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
    });
    renderModal({ lyrics: "Letra da música", onUseAsCover });
    fireEvent.click(screen.getByText("🎨 Gerar capa"));
    await waitFor(() =>
      expect(screen.getByText("✅ Usar como Capa")).toBeTruthy(),
    );
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.provider).toBe("gemini");
    expect(body.aspectRatio).toBe("1:1");
    expect(body.prompt).toContain("Letra da música");
    fireEvent.click(screen.getByText("✅ Usar como Capa"));
    expect(onUseAsCover).toHaveBeenCalledTimes(1);
    const url = onUseAsCover.mock.calls[0][0] as string;
    expect(url.startsWith("data:image/png")).toBe(true);
  });

  it("surfaces a friendly error from the backend on failure", async () => {
    useSettingsAIStore.setState({ aiKeys: { gemini: "AIza-secret" } });
    fetchSpy.mockImplementation(async (url) => {
      if (String(url).includes("/generate-cover")) {
        return {
          ok: false,
          status: 502,
          json: async () => ({ error: "Falha no provedor de IA. Tente novamente." }),
        } as unknown as Response;
      }
      return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
    });
    renderModal({ lyrics: "Letra da música" });
    fireEvent.click(screen.getByText("🎨 Gerar capa"));
    await waitFor(() =>
      expect(
        screen.getByText("Falha no provedor de IA. Tente novamente."),
      ).toBeTruthy(),
    );
  });

  it("sanitizeCoverFilename strips illegal characters and falls back to capa", () => {
    expect(sanitizeCoverFilename("My Song / V2")).toBe("My Song V2");
    expect(sanitizeCoverFilename('a:b*c?d<e>f|g\\h"i')).toBe("abcdefghi");
    expect(sanitizeCoverFilename("  ")).toBe("capa");
    expect(sanitizeCoverFilename("")).toBe("capa");
    expect(sanitizeCoverFilename("Tab\u0000song")).toBe("Tabsong");
  });
});
