import assert from "assert";
import jwt from "jsonwebtoken";
import express from "express";
import { createServer, Server } from "http";
import { AddressInfo } from "net";
import aiRoutes, {
  resolveImageSize,
  resolveModel,
  mapProviderError,
} from "./ai";

async function main() {
  process.env.JWT_SECRET = "test-secret";
  const token = jwt.sign({ userId: "u1", tier: "free" }, "test-secret");

  // ── pure helpers ──
  assert.strictEqual(resolveImageSize("gemini", "1:1"), "1:1");
  assert.strictEqual(resolveImageSize("gemini", "16:9"), "16:9");
  assert.strictEqual(resolveImageSize("gemini", "9:16"), "9:16");
  assert.strictEqual(resolveImageSize("gemini", "4:3"), "4:3");
  assert.strictEqual(resolveImageSize("gemini", "3:4"), "3:4");

  assert.deepStrictEqual(resolveImageSize("huggingface", "1:1"), {
    width: 1024,
    height: 1024,
  });
  assert.deepStrictEqual(resolveImageSize("huggingface", "16:9"), {
    width: 1344,
    height: 768,
  });
  assert.deepStrictEqual(resolveImageSize("huggingface", "9:16"), {
    width: 768,
    height: 1344,
  });
  assert.deepStrictEqual(resolveImageSize("huggingface", "4:3"), {
    width: 1024,
    height: 768,
  });
  assert.deepStrictEqual(resolveImageSize("huggingface", "3:4"), {
    width: 768,
    height: 1024,
  });

  assert.strictEqual(resolveImageSize("openai", "1:1"), "1024x1024");
  assert.strictEqual(resolveImageSize("openai", "16:9"), "1536x1024");
  assert.strictEqual(resolveImageSize("openai", "9:16"), "1024x1536");
  assert.strictEqual(resolveImageSize("openai", "4:3"), "1024x1024");
  assert.strictEqual(resolveImageSize("openai", "3:4"), "1024x1024");
  assert.strictEqual(resolveImageSize("openrouter", "16:9"), "1536x1024");

  assert.strictEqual(
    resolveModel("gemini", undefined, "image"),
    "gemini-3.1-flash-image",
  );
  assert.strictEqual(resolveModel("openai", undefined, "image"), "gpt-image-2");
  assert.strictEqual(
    resolveModel("openrouter", undefined, "image"),
    "black-forest-labs/flux-1.1-pro",
  );
  assert.strictEqual(
    resolveModel("huggingface", undefined, "image"),
    "black-forest-labs/FLUX.1-schnell",
  );
  assert.strictEqual(
    resolveModel("claude", undefined, "refine"),
    "claude-3-7-sonnet",
  );
  assert.strictEqual(resolveModel("gemini", "custom-model", "image"), "custom-model");

  assert.deepStrictEqual(mapProviderError(401), {
    status: 400,
    error: "Chave de API inválida ou sem permissão.",
  });
  assert.deepStrictEqual(mapProviderError(403), {
    status: 400,
    error: "Chave de API inválida ou sem permissão.",
  });
  assert.deepStrictEqual(mapProviderError(402), {
    status: 400,
    error: "Sem créditos suficientes neste provedor.",
  });
  assert.deepStrictEqual(mapProviderError(429), {
    status: 429,
    error: "Limite de requisições atingido. Tente novamente em instantes.",
  });
  assert.deepStrictEqual(mapProviderError(404), {
    status: 400,
    error: "Modelo ou endpoint indisponível.",
  });
  assert.deepStrictEqual(mapProviderError(500), {
    status: 502,
    error: "Falha no provedor de IA. Tente novamente.",
  });

  // ── HTTP routes (auth + claude rejection) ──
  const app = express();
  app.use(express.json());
  app.use("/api/ai", aiRoutes);
  const server: Server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/ai`;

  try {
    const post = (path: string, body: unknown, withAuth = false) =>
      fetch(`${base}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(withAuth ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

    let res = await post("/generate-cover", {
      provider: "claude",
      apiKey: "x",
      prompt: "test",
    }, true);
    assert.strictEqual(res.status, 400);
    assert.deepStrictEqual(await res.json(), {
      error: "Provedor e chave de API são obrigatórios.",
    });

    res = await post("/generate-cover", { provider: "gemini", apiKey: "x", prompt: "test" });
    assert.strictEqual(res.status, 401, "generate-cover requires auth");

    res = await post("/test-key", { provider: "gemini", apiKey: "x" });
    assert.strictEqual(res.status, 401, "test-key requires auth");

    res = await post("/test-key", { provider: "nope", apiKey: "x" }, true);
    assert.strictEqual(res.status, 400);
    assert.deepStrictEqual(await res.json(), {
      error: "Provedor e chave de API são obrigatórios.",
    });

    console.log("backend ai routes: OK");
  } finally {
    server.close();
  }
}

main().catch((e) => {
  console.error("backend ai test failed:", e);
  process.exit(1);
});
