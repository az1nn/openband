import { describe, it, expect, beforeEach } from "vitest";
import {
  useSettingsAIStore,
  AI_PROVIDERS,
  IMAGE_MODELS,
  REFINER_MODELS,
  ASPECT_RATIOS,
} from "../src/lib/settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    useSettingsAIStore.setState({
      aiKeys: {},
      defaultImageProvider: "gemini",
      defaultPromptRefiner: "claude",
    });
    localStorage.clear();
  });

  it("starts with spec defaults", () => {
    const s = useSettingsAIStore.getState();
    expect(s.aiKeys).toEqual({});
    expect(s.defaultImageProvider).toBe("gemini");
    expect(s.defaultPromptRefiner).toBe("claude");
  });

  it("setAIKey trims the key before storing", () => {
    useSettingsAIStore.getState().setAIKey("gemini", "  abc-123  ");
    expect(useSettingsAIStore.getState().aiKeys.gemini).toBe("abc-123");
  });

  it("setAIKey with an empty value removes the key", () => {
    useSettingsAIStore.getState().setAIKey("openai", "sk-1");
    useSettingsAIStore.getState().setAIKey("openai", "   ");
    expect(useSettingsAIStore.getState().aiKeys.openai).toBeUndefined();
  });

  it("removeAIKey deletes only the target provider", () => {
    useSettingsAIStore.getState().setAIKey("gemini", "g");
    useSettingsAIStore.getState().setAIKey("openai", "o");
    useSettingsAIStore.getState().removeAIKey("gemini");
    const keys = useSettingsAIStore.getState().aiKeys;
    expect(keys.gemini).toBeUndefined();
    expect(keys.openai).toBe("o");
  });

  it("persists to localStorage and rehydrates from it", async () => {
    useSettingsAIStore.getState().setAIKey("huggingface", "hf_123");
    useSettingsAIStore
      .getState()
      .setDefaults({ defaultImageProvider: "openai" });
    const persisted = localStorage.getItem("openband-ai-settings");
    expect(persisted).toBeTruthy();
    expect(persisted).toContain("hf_123");

    useSettingsAIStore.setState({
      aiKeys: {},
      defaultImageProvider: "gemini",
      defaultPromptRefiner: "claude",
    });
    localStorage.setItem("openband-ai-settings", persisted as string);
    await useSettingsAIStore.persist.rehydrate();
    const s = useSettingsAIStore.getState();
    expect(s.aiKeys.huggingface).toBe("hf_123");
    expect(s.defaultImageProvider).toBe("openai");
  });

  it("exports 5 providers in spec order with metadata", () => {
    expect(AI_PROVIDERS.map((p) => p.id)).toEqual([
      "gemini",
      "openai",
      "openrouter",
      "claude",
      "huggingface",
    ]);
    expect(AI_PROVIDERS[0].name).toBe("Google Gemini");
    expect(AI_PROVIDERS[3].function).toBe("Apenas refinar prompt");
  });

  it("exports image models per provider", () => {
    expect(IMAGE_MODELS.gemini).toContain("gemini-3.1-flash-image");
    expect(IMAGE_MODELS.openai).toEqual(["gpt-image-2", "dall-e-3"]);
    expect(IMAGE_MODELS.huggingface[0]).toBe(
      "black-forest-labs/FLUX.1-schnell",
    );
  });

  it("exports refiner models and aspect ratios", () => {
    expect(REFINER_MODELS.claude[0]).toBe("claude-3-7-sonnet");
    expect(REFINER_MODELS.gemini).toEqual(["gemini-2.5-pro"]);
    expect(ASPECT_RATIOS.map((r) => r.id)).toEqual([
      "1:1",
      "16:9",
      "9:16",
      "4:3",
      "3:4",
    ]);
    expect(ASPECT_RATIOS[0].label).toBe("Capa");
  });
});
