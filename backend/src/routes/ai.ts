import { Router, Request, Response as ExpressResponse } from "express";
import { requireAuth } from "../middleware/authMiddleware";

type AIProvider =
  | "gemini"
  | "openai"
  | "openrouter"
  | "claude"
  | "huggingface";

type ImageProvider = Exclude<AIProvider, "claude">;

type RefinerProvider = Exclude<AIProvider, "huggingface">;

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

const ASPECT_RATIO_IDS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const PROVIDER_TIMEOUT_MS = 25000;

const MAX_PROVIDER_BODY_BYTES = 25 * 1024 * 1024;

const IMAGE_MODEL_DEFAULTS: Record<ImageProvider, string> = {
  gemini: "gemini-3.1-flash-image",
  openai: "gpt-image-2",
  openrouter: "black-forest-labs/flux-1.1-pro",
  huggingface: "black-forest-labs/FLUX.1-schnell",
};

const REFINER_MODEL_DEFAULTS: Record<RefinerProvider, string> = {
  claude: "claude-3-7-sonnet",
  gemini: "gemini-2.5-pro",
  openai: "gpt-4o-mini",
  openrouter: "anthropic/claude-3.5-haiku",
};

const IMAGE_MODEL_ALLOWLISTS: Record<ImageProvider, string[]> = {
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

const REFINER_MODEL_ALLOWLISTS: Record<RefinerProvider, string[]> = {
  claude: ["claude-3-7-sonnet", "claude-3-5-haiku"],
  gemini: ["gemini-2.5-pro"],
  openai: ["gpt-4o-mini"],
  openrouter: ["anthropic/claude-3.5-haiku", "google/gemini-2.5-pro"],
};

export function resolveModel(
  provider: AIProvider,
  model?: string,
  op: "image" | "refine" = "image",
): string {
  if (model) return model;
  const defaults =
    op === "refine" ? REFINER_MODEL_DEFAULTS : IMAGE_MODEL_DEFAULTS;
  return (defaults as Record<string, string>)[provider] ?? model ?? "";
}

export function resolveImageSize(
  provider: ImageProvider,
  aspectRatio: AspectRatio,
): string | { width: number; height: number } {
  if (provider === "gemini") return aspectRatio;
  if (provider === "huggingface") {
    const dims: Record<AspectRatio, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1344, height: 768 },
      "9:16": { width: 768, height: 1344 },
      "4:3": { width: 1024, height: 768 },
      "3:4": { width: 768, height: 1024 },
    };
    return dims[aspectRatio];
  }
  const sizes: Record<AspectRatio, string> = {
    "1:1": "1024x1024",
    "16:9": "1536x1024",
    "9:16": "1024x1536",
    "4:3": "1024x1024",
    "3:4": "1024x1024",
  };
  return sizes[aspectRatio];
}

function resolveOpenAISize(model: string, aspectRatio: AspectRatio): string {
  if (model === "dall-e-3") {
    const dallE3Sizes: Record<AspectRatio, string> = {
      "1:1": "1024x1024",
      "16:9": "1792x1024",
      "9:16": "1024x1792",
      "4:3": "1024x1024",
      "3:4": "1024x1024",
    };
    return dallE3Sizes[aspectRatio];
  }
  return resolveImageSize("openai", aspectRatio) as string;
}

export function mapProviderError(providerStatus: number): {
  status: number;
  error: string;
} {
  if (providerStatus === 401 || providerStatus === 403) {
    return { status: 400, error: "Chave de API inválida ou sem permissão." };
  }
  if (providerStatus === 402) {
    return { status: 400, error: "Sem créditos suficientes neste provedor." };
  }
  if (providerStatus === 429) {
    return {
      status: 429,
      error: "Limite de requisições atingido. Tente novamente em instantes.",
    };
  }
  if (providerStatus === 404) {
    return { status: 400, error: "Modelo ou endpoint indisponível." };
  }
  return { status: 502, error: "Falha no provedor de IA. Tente novamente." };
}

function details(e: unknown): { details?: string } {
  return process.env.NODE_ENV === "production"
    ? {}
    : { details: e instanceof Error ? e.message : String(e) };
}

function isTimeoutError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  return (
    e.name === "AbortError" ||
    e.name === "TimeoutError" ||
    e.message.toLowerCase().includes("aborted") ||
    e.message.toLowerCase().includes("fetch failed") ||
    e.message.toLowerCase().includes("timeout")
  );
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function assertProviderBodySize(res: Response, bytes?: number): void {
  const declared = Number(res.headers.get("content-length"));
  if (declared && declared > MAX_PROVIDER_BODY_BYTES) {
    throw new Error("Resposta do provedor excedeu o limite de tamanho.");
  }
  if (typeof bytes === "number" && bytes > MAX_PROVIDER_BODY_BYTES) {
    throw new Error("Resposta do provedor excedeu o limite de tamanho.");
  }
}

function isProvider(v: unknown): v is AIProvider {
  return (
    v === "gemini" ||
    v === "openai" ||
    v === "openrouter" ||
    v === "claude" ||
    v === "huggingface"
  );
}

function isImageProvider(v: unknown): v is ImageProvider {
  return (
    v === "gemini" ||
    v === "openai" ||
    v === "openrouter" ||
    v === "huggingface"
  );
}

function isRefinerProvider(v: unknown): v is RefinerProvider {
  return (
    v === "claude" || v === "gemini" || v === "openai" || v === "openrouter"
  );
}

function respondWithError(
  res: ExpressResponse,
  e: unknown,
  fallback: string,
): ExpressResponse {
  const err = e as { status?: number; message?: string };
  const isMapped =
    typeof err?.status === "number" && err.status >= 400 && err.status < 600;
  const status = isMapped ? (err.status as number) : 502;
  const error = isTimeoutError(e)
    ? fallback
    : isMapped || process.env.NODE_ENV !== "production"
      ? err?.message ?? fallback
      : fallback;
  return res.status(status).json({
    error,
    ...details(e),
  });
}

function buildTestKeyRequest(
  provider: AIProvider,
  key: string,
): [string, Record<string, string>] {
  switch (provider) {
    case "gemini":
      return [
        "https://generativelanguage.googleapis.com/v1beta/models",
        { "x-goog-api-key": key },
      ];
    case "openai":
      return ["https://api.openai.com/v1/models", { Authorization: `Bearer ${key}` }];
    case "openrouter":
      return ["https://openrouter.ai/api/v1/key", { Authorization: `Bearer ${key}` }];
    case "claude":
      return [
        "https://api.anthropic.com/v1/models",
        { "x-api-key": key, "anthropic-version": "2023-06-01" },
      ];
    case "huggingface":
      return [
        "https://api-inference.huggingface.co/models",
        { Authorization: `Bearer ${key}` },
      ];
  }
}

const REFINE_SYSTEM_PROMPT =
  "Você é especialista em capas de álbuns musicais. Transforme a entrada em um prompt de imagem profissional (40–80 palavras) descrevendo cena, atmosfera, cores, iluminação e emoção. NUNCA inclua texto, palavras ou tipografia na imagem.";

async function callRefiner(
  provider: RefinerProvider,
  apiKey: string,
  model: string,
  system: string,
  source: string,
): Promise<string> {
  let url = "";
  let init: RequestInit = {};
  switch (provider) {
    case "claude":
      url = "https://api.anthropic.com/v1/messages";
      init = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 512,
          system,
          messages: [{ role: "user", content: source }],
        }),
      };
      break;
    case "gemini":
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      init = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\n${source}` }] }],
        }),
      };
      break;
    case "openai":
    case "openrouter": {
      const base =
        provider === "openai"
          ? "https://api.openai.com/v1/chat/completions"
          : "https://openrouter.ai/api/v1/chat/completions";
      url = base;
      init = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: source },
          ],
        }),
      };
      break;
    }
  }
  const res = await fetchWithTimeout(url, init, PROVIDER_TIMEOUT_MS);
  const raw = await res.text().catch(() => "");
  assertProviderBodySize(res, Buffer.byteLength(raw, "utf8"));
  if (!res.ok) {
    const mapped = mapProviderError(res.status);
    const err = new Error(mapped.error) as Error & { status?: number };
    err.status = mapped.status;
    throw err;
  }
  const data = safeJsonParse(raw) as Record<string, unknown> | undefined;
  if (provider === "claude") {
    const text = (data as any)?.content?.[0]?.text;
    if (typeof text !== "string") throw new Error("Resposta inválida do provedor.");
    return text;
  }
  if (provider === "gemini") {
    const parts = (data as any)?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts)
      ? (parts as any[])
          .map((p) => p?.text)
          .filter((t): t is string => typeof t === "string")
          .join("\n")
      : "";
    if (!text) throw new Error("Resposta inválida do provedor.");
    return text;
  }
  const text = (data as any)?.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new Error("Resposta inválida do provedor.");
  return text;
}

async function generateImage(
  provider: ImageProvider,
  apiKey: string,
  model: string,
  prompt: string,
  aspectRatio: AspectRatio,
  quality: "standard" | "high",
): Promise<Buffer> {
  let url = "";
  let init: RequestInit = {};
  switch (provider) {
    case "gemini":
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      init = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio },
          },
        }),
      };
      break;
    case "openai":
      url = "https://api.openai.com/v1/images/generations";
      init = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          size: resolveOpenAISize(model, aspectRatio),
          n: 1,
          response_format: "b64_json",
          quality,
        }),
      };
      break;
    case "openrouter":
      url = "https://openrouter.ai/api/v1/images/generations";
      init = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          response_format: "b64_json",
          size: resolveImageSize(provider, aspectRatio),
        }),
      };
      break;
    case "huggingface": {
      url = `https://api-inference.huggingface.co/models/${model}`;
      const dims = resolveImageSize(provider, aspectRatio) as {
        width: number;
        height: number;
      };
      init = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width: dims.width, height: dims.height },
        }),
      };
      break;
    }
  }
  const res = await fetchWithTimeout(url, init, PROVIDER_TIMEOUT_MS);
  if (!res.ok) {
    await res.text().catch(() => "");
    const mapped = mapProviderError(res.status);
    const err = new Error(mapped.error) as Error & { status?: number };
    err.status = mapped.status;
    throw err;
  }
  assertProviderBodySize(res);
  if (provider === "huggingface") {
    const buf = Buffer.from(await res.arrayBuffer());
    assertProviderBodySize(res, buf.length);
    if (buf.length === 0) throw new Error("O provedor retornou uma imagem vazia.");
    return buf;
  }
  const raw = await res.text().catch(() => "");
  assertProviderBodySize(res, Buffer.byteLength(raw, "utf8"));
  const data = safeJsonParse(raw) as Record<string, unknown> | undefined;
  let b64: unknown;
  if (provider === "gemini") {
    const parts = (data as any)?.candidates?.[0]?.content?.parts;
    const inline = Array.isArray(parts)
      ? (parts as any[]).find((p) => p?.inlineData?.data)
      : undefined;
    b64 = inline?.inlineData?.data;
  } else {
    b64 = (data as any)?.data?.[0]?.b64_json;
    if (typeof b64 !== "string") {
      const imageUrl = (data as any)?.data?.[0]?.url;
      if (typeof imageUrl === "string") {
        const imgRes = await fetchWithTimeout(
          imageUrl,
          { method: "GET" },
          PROVIDER_TIMEOUT_MS,
        );
        if (!imgRes.ok) throw new Error("Falha ao baixar a imagem do provedor.");
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        assertProviderBodySize(imgRes, imgBuf.length);
        return imgBuf;
      }
    }
  }
  if (typeof b64 !== "string" || !b64) {
    throw new Error("O provedor não retornou uma imagem válida.");
  }
  return Buffer.from(b64, "base64");
}

const router = Router();

router.post("/test-key", requireAuth, async (req: Request, res: ExpressResponse) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const { provider, apiKey } = body;
    if (!isProvider(provider) || typeof apiKey !== "string" || !apiKey.trim()) {
      return res
        .status(400)
        .json({ error: "Provedor e chave de API são obrigatórios." });
    }
    const key = apiKey.trim();
    const [url, headers] = buildTestKeyRequest(provider, key);
    const providerRes = await fetchWithTimeout(
      url,
      { method: "GET", headers },
      PROVIDER_TIMEOUT_MS,
    );
    if (!providerRes.ok) {
      const mapped = mapProviderError(providerRes.status);
      return res.status(mapped.status).json({ ok: false, error: mapped.error });
    }
    return res.json({ ok: true, message: "Chave funcionando!" });
  } catch (e) {
    return respondWithError(res, e, "Falha ao testar a chave. Tente novamente.");
  }
});

router.post("/refine-prompt", requireAuth, async (req: Request, res: ExpressResponse) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const { provider, apiKey, lyrics, customPrompt } = body;
    if (!isRefinerProvider(provider) || typeof apiKey !== "string" || !apiKey.trim()) {
      return res
        .status(400)
        .json({ error: "Provedor e chave de API são obrigatórios." });
    }
    const source =
      (typeof customPrompt === "string" ? customPrompt.trim() : "") ||
      (typeof lyrics === "string" ? lyrics.trim() : "");
    if (!source) {
      return res.status(400).json({ error: "Nenhum texto para refinar." });
    }
    const title =
      typeof body.projectTitle === "string" && body.projectTitle.trim()
        ? body.projectTitle.trim()
        : "Sem título";
    const genre =
      typeof body.genre === "string" && body.genre.trim()
        ? body.genre.trim()
        : "desconhecido";
    const system = `${REFINE_SYSTEM_PROMPT} Contexto: título '${title}', gênero '${genre}'.`;
    const modelRaw =
      typeof body.model === "string" ? body.model.trim() : "";
    if (modelRaw && !REFINER_MODEL_ALLOWLISTS[provider].includes(modelRaw)) {
      return res
        .status(400)
        .json({ error: "Modelo de refino não suportado para este provedor." });
    }
    const model = resolveModel(provider, modelRaw || undefined, "refine");
    const refined = await callRefiner(
      provider,
      apiKey.trim(),
      model,
      system,
      source,
    );
    return res.json({ refined });
  } catch (e) {
    return respondWithError(res, e, "Falha ao refinar o prompt. Tente novamente.");
  }
});

router.post("/generate-cover", requireAuth, async (req: Request, res: ExpressResponse) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const { provider, apiKey } = body;
    if (!isImageProvider(provider) || typeof apiKey !== "string" || !apiKey.trim()) {
      return res
        .status(400)
        .json({ error: "Provedor e chave de API são obrigatórios." });
    }
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return res.status(400).json({ error: "O prompt é obrigatório." });
    }
    const aspectRatio: AspectRatio = ASPECT_RATIO_IDS.includes(
      body.aspectRatio as AspectRatio,
    )
      ? (body.aspectRatio as AspectRatio)
      : "1:1";
    const quality = body.quality === "high" ? "high" : "standard";
    const modelRaw =
      typeof body.model === "string" ? body.model.trim() : "";
    if (modelRaw && !IMAGE_MODEL_ALLOWLISTS[provider].includes(modelRaw)) {
      return res
        .status(400)
        .json({ error: "Modelo de imagem não suportado para este provedor." });
    }
    const model = resolveModel(provider, modelRaw || undefined, "image");
    const finalPrompt = `${prompt} sem texto sobreposto na imagem`;
    const png = await generateImage(
      provider,
      apiKey.trim(),
      model,
      finalPrompt,
      aspectRatio,
      quality,
    );
    res.setHeader("Content-Type", "image/png");
    res.setHeader("X-OpenBand-Aspect-Ratio", aspectRatio);
    return res.send(png);
  } catch (e) {
    return respondWithError(res, e, "Falha ao gerar a capa. Tente novamente.");
  }
});

router.post("/generate-video", requireAuth, async (_req: Request, res: ExpressResponse) => {
  return res.status(501).json({ error: "Geração de vídeo ainda não disponível." });
});

router.post("/video/status", requireAuth, async (_req: Request, res: ExpressResponse) => {
  return res.status(501).json({ error: "Geração de vídeo ainda não disponível." });
});

export default router;
