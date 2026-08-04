import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { Platform } from "react-native";
import { OpenBandNative } from "../bridge";

export type AIProvider =
  | "gemini"
  | "openai"
  | "openrouter"
  | "claude"
  | "huggingface";

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export type AISource = "lyrics" | "custom";

export interface AIConfig {
  aiKeys: Partial<Record<AIProvider, string>>;
  defaultImageProvider: AIProvider;
  defaultPromptRefiner: AIProvider | null;
}

interface SettingsAIStore extends AIConfig {
  setAIKey(provider: AIProvider, key: string): void;
  removeAIKey(provider: AIProvider): void;
  setDefaults(config: Partial<AIConfig>): void;
}

const memoryStore = new Map<string, string>();

function createMemoryStorage(): StateStorage {
  return {
    getItem: (key) => memoryStore.get(key) ?? null,
    setItem: (key, value) => {
      memoryStore.set(key, value);
    },
    removeItem: (key) => {
      memoryStore.delete(key);
    },
  };
}

function createLocalStorage(): StateStorage | null {
  if (typeof localStorage !== "undefined") {
    return {
      getItem: (key) => localStorage.getItem(key),
      setItem: (key, value) => {
        localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
      },
    };
  }
  return null;
}

let nativePathPromise: Promise<string> | null = null;

function getNativePath(): Promise<string> {
  if (!nativePathPromise) {
    nativePathPromise = OpenBandNative.getAppDataPath()
      .then((dir) => `${dir}/ai-settings.json`)
      .catch((e) => {
        nativePathPromise = null;
        throw e;
      });
  }
  return nativePathPromise;
}

let storageWarned = false;

function warnOnce(message: string): void {
  if (storageWarned) return;
  storageWarned = true;
  console.warn(message);
}

function createBridgeStorage(): StateStorage {
  const memory = createMemoryStorage();
  return {
    async getItem(key) {
      try {
        const path = await getNativePath();
        const buf = await OpenBandNative.readFile(path);
        return new TextDecoder().decode(buf);
      } catch {
        return memory.getItem(key);
      }
    },
    async setItem(key, value) {
      try {
        const path = await getNativePath();
        await OpenBandNative.writeFile(path, value);
      } catch (e) {
        memory.setItem(key, value);
        warnOnce(
          "[settingsStore] AI keys file storage unavailable — keys kept in memory only for this session.",
        );
        void e;
      }
    },
    async removeItem(key) {
      try {
        const path = await getNativePath();
        await OpenBandNative.writeFile(path, "{}");
      } catch {
        memory.removeItem(key);
      }
    },
  };
}

export const aiStorage: StateStorage = (() => {
  if (Platform.OS === "web") {
    const ls = createLocalStorage();
    if (ls) return ls;
    warnOnce(
      "[settingsStore] localStorage unavailable — AI settings will not persist.",
    );
    return createMemoryStorage();
  }
  return createBridgeStorage();
})();

export const useSettingsAIStore = create<SettingsAIStore>()(
  persist(
    (set) => ({
      aiKeys: {},
      defaultImageProvider: "gemini",
      defaultPromptRefiner: "claude",
      setAIKey: (p, key) =>
        set((s) => {
          const trimmed = key.trim();
          if (!trimmed) {
            const { [p]: _drop, ...rest } = s.aiKeys;
            return { aiKeys: rest };
          }
          return { aiKeys: { ...s.aiKeys, [p]: trimmed } };
        }),
      removeAIKey: (p) =>
        set((s) => {
          const { [p]: _drop, ...rest } = s.aiKeys;
          return { aiKeys: rest };
        }),
      setDefaults: (cfg) => set((s) => ({ ...s, ...cfg })),
    }),
    { name: "openband-ai-settings", storage: createJSONStorage(() => aiStorage) },
  ),
);

export interface AIProviderMeta {
  id: AIProvider;
  name: string;
  function: string;
  description: string;
  signupUrl: string;
}

export const AI_PROVIDERS: AIProviderMeta[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    function: "Imagem + Refinar",
    description:
      "Geração de imagem e refinamento de prompt com free tier generoso.",
    signupUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    function: "Imagem + Vídeo",
    description: "Imagens (gpt-image-2, dall-e-3) e vídeos (Sora).",
    signupUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    function: "Imagens do mercado",
    description: "Todos os modelos do mercado com uma única chave.",
    signupUrl: "https://openrouter.ai/keys",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    function: "Apenas refinar prompt",
    description: "Usado somente para refinar prompts, nunca gera imagens.",
    signupUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    function: "Imagem gratuita",
    description: "Modelos open-source gratuitos como FLUX.1-schnell.",
    signupUrl: "https://huggingface.co/settings/tokens",
  },
];

export const IMAGE_MODELS: Record<
  Exclude<AIProvider, "claude">,
  string[]
> = {
  gemini: ["gemini-3.1-flash-image", "gemini-3-pro-image"],
  openai: ["gpt-image-2", "dall-e-3"],
  openrouter: [
    "black-forest-labs/flux-1.1-pro",
    "google/gemini-3.1-flash-image",
  ],
  huggingface: [
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-xl-base-1.0",
  ],
};

export type ImageProvider = keyof typeof IMAGE_MODELS;

export const REFINER_PROVIDERS = [
  "claude",
  "gemini",
  "openai",
  "openrouter",
] as const;

export type RefinerProvider = (typeof REFINER_PROVIDERS)[number];

export const REFINER_MODELS: Record<RefinerProvider, string[]> = {
  claude: ["claude-3-7-sonnet", "claude-3-5-haiku"],
  gemini: ["gemini-2.5-pro"],
  openai: ["gpt-4o-mini"],
  openrouter: ["anthropic/claude-3.5-haiku", "google/gemini-2.5-pro"],
};

export const ASPECT_RATIOS: { id: AspectRatio; label: string }[] = [
  { id: "1:1", label: "Capa" },
  { id: "16:9", label: "YouTube" },
  { id: "9:16", label: "Reels" },
  { id: "4:3", label: "Post" },
  { id: "3:4", label: "Pinterest" },
];
