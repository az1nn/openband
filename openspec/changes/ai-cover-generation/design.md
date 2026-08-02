# Design — AI Cover Generation (BYOK)

## File / Requirement Mapping

| Change | File | Symbols |
|---|---|---|
| Settings store | `src/lib/settingsStore.ts` (new) | `AIProvider`, `AIConfig`, `useSettingsAIStore`, `AI_PROVIDERS`, `IMAGE_MODELS`, `REFINER_MODELS`, `ASPECT_RATIOS` |
| Settings AI screen | `app/settings-ai.tsx` (new) | default-export screen component; provider cards |
| Register screen | `app/_layout.tsx` | `<Stack.Screen name="settings-ai" options={{ title: "IA & Chaves", presentation: "modal" }} />` |
| Settings tab link | `app/tabs/settings.tsx` | new `CardRow` "IA & Chaves de API" → `router.push("/settings-ai")` |
| GenerateCoverModal | `src/components/GenerateCoverModal.tsx` (new) | `GenerateCoverModal({ visible, onClose, projectTitle, genre, lyrics, onLyricsChange, onUseAsCover })`; export from `src/components/index.ts` |
| Studio modal wiring | `app/studio/hooks.ts` | add `"generateCover"` to `ModalId` union (~line 369) + init `generateCover: false` in `useStudioModals` (~line 409) |
| Studio modal render | `app/studio/StudioModals.tsx` | render `<GenerateCoverModal … />` when `modals.generateCover`; wire lyrics/cover handlers |
| Studio button | `app/studio/[id].tsx` | "✨ Gerar Capa com IA" button (header area) → `openModal("generateCover")`; `handleUseAsCover` persists `project.coverUrl` |
| Project model | `src/lib/projectStore.ts` | `ProjectData` gains `coverUrl?: string` and `lyrics?: string`; `sanitizeProjectData` preserves both |
| Library rendering | `src/components/ProjectCard.tsx` | render `coverUrl` as `<Image>` if present, else existing ♫ placeholder |
| Backend AI routes | `backend/src/routes/ai.ts` (new) | default-export `Router`; helper fns `testProviderKey`, `refinePrompt`, `generateImage`, `generateVideo`, `mapProviderError`; pure helpers `resolveImageSize`, `resolveModel` |
| Register routes | `backend/src/app.ts` | import + `app.use("/api/ai", aiRoutes)` (after line ~157) |
| Backend tests | `backend/src/routes/ai.test.ts` (new) | standalone `node:assert` script (pattern: `storage.test.ts`) for pure helpers |
| Dependency | `package.json` | add `zustand` (direct; currently transitive) |
| Source spec doc | `docs/AI_INTEGRATION_AGENT_SPEC.md` (new) | verbatim copy of the product spec (v1.0) |

---

## 1. Shared Types (frontend + backend, kept in sync)

The frontend and backend are separate TS projects with no shared module, so the small union type is duplicated and kept in sync by convention:

```ts
export type AIProvider = "gemini" | "openai" | "openrouter" | "claude" | "huggingface";
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type AISource = "lyrics" | "custom";
```

**Provider capability matrix** (used to disable providers in selectors, and by the backend to allow/deny each operation):

| Provider | test-key | refine | image | video | Default image model | Default refiner model |
|---|---|---|---|---|---|---|
| `gemini` | ✅ | ✅ | ✅ | ❌ | `gemini-3.1-flash-image` | `gemini-2.5-pro` |
| `openai` | ✅ | ✅ | ✅ | ✅ | `gpt-image-2` | `gpt-4o-mini` |
| `openrouter` | ✅ | ✅ | ✅ | ⚠️ (passthrough) | `black-forest-labs/flux-1.1-pro` | `anthropic/claude-3.5-haiku` |
| `claude` | ✅ | ✅ | ❌ | ❌ | — | `claude-3-7-sonnet` |
| `huggingface` | ✅ | ❌ | ✅ | ❌ | `black-forest-labs/FLUX.1-schnell` | — |

Rule (spec §6): **Claude is NEVER used to generate images/videos** — refine only. `gemini-3.1-flash-image` and `FLUX.1-schnell` are free-tier defaults. **Model naming:** the canonical Gemini image model is `gemini-3.1-flash-image` (the spec's `gemini-3.1-flash-image-preview` in its §5.3.3 example is treated as the same/preview lineage); the implementing agent verifies the exact current model id against https://ai.google.dev/api and uses the verified id as the single source of truth in `IMAGE_MODELS`.

**Image model options per provider**:
```ts
IMAGE_MODELS: Record<Exclude<AIProvider, "claude">, string[]> = {
  gemini:       ["gemini-3.1-flash-image", "gemini-3-pro-image"],
  openai:       ["gpt-image-2", "dall-e-3"],
  openrouter:   ["black-forest-labs/flux-1.1-pro", "google/gemini-3.1-flash-image"],  huggingface:  ["black-forest-labs/FLUX.1-schnell", "stabilityai/stable-diffusion-xl-base-1.0"],
};
REFINER_MODELS: Record<"claude" | "gemini" | "openai" | "openrouter", string[]> = {
  claude:     ["claude-3-7-sonnet", "claude-3-5-haiku"],
  gemini:     ["gemini-2.5-pro"],
  openai:     ["gpt-4o-mini"],
  openrouter: ["anthropic/claude-3.5-haiku", "google/gemini-2.5-pro"],
};
```

---

## 2. Settings Store (`src/lib/settingsStore.ts`)

**Dependency:** add `zustand` to `package.json` dependencies (only transitive today). Uses `zustand/middleware` `persist` + `createJSONStorage`.

```ts
export interface AIConfig {
  aiKeys: Partial<Record<AIProvider, string>>;
  defaultImageProvider: AIProvider;
  defaultPromptRefiner: AIProvider | null; // "claude" by default
}

interface SettingsAIStore extends AIConfig {
  setAIKey(provider: AIProvider, key: string): void;      // trims; no empty values
  removeAIKey(provider: AIProvider): void;
  setDefaults(config: Partial<AIConfig>): void;
}

export const useSettingsAIStore = create<SettingsAIStore>()(
  persist(
    (set) => ({
      aiKeys: {},
      defaultImageProvider: "gemini",
      defaultPromptRefiner: "claude",
      setAIKey: (p, key) =>
        set((s) => ({ aiKeys: { ...s.aiKeys, [p]: key.trim() } })),
      removeAIKey: (p) =>
        set((s) => { const { [p]: _drop, ...rest } = s.aiKeys; return { aiKeys: rest }; }),
      setDefaults: (cfg) => set((s) => ({ ...s, ...cfg })),
    }),
    { name: "openband-ai-settings", storage: createJSONStorage(aiStorage) },
  ),
);
```

**`aiStorage` adapter** (persistence across platforms — spec requires keys survive app restart, stored **only locally**):
- Web + Electron renderer → `localStorage` (default zustand storage; Electron persists it in the profile dir).
- Native (`Platform.OS !== "web"` and no `window.electronAPI`) → `OpenBandNative.readFile`/`writeFile` of a `ai-settings.json` under `getAppDataPath()`, wrapped as an async `StateStorage` (`getItem`/`setItem`/`removeItem`). If the bridge is unavailable, degrade to an in-memory store with `console.warn`.
- Never write keys to `sessionStorage`, server, Supabase, or telemetry.

**Helpers exported** (used by screen + modal): `hasKey(p)` selectors (`useSettingsAIStore(s => !!s.aiKeys[p])`), `AI_PROVIDERS` metadata array (order: Gemini → OpenAI → OpenRouter → Claude → Hugging Face; each with `{ id, name, function, description, signupUrl }`), `IMAGE_MODELS`, `REFINER_MODELS`, `ASPECT_RATIOS` (5 entries). `signupUrl`s: `https://aistudio.google.com/app/apikey`, `https://platform.openai.com/api-keys`, `https://openrouter.ai/keys`, `https://console.anthropic.com/settings/keys`, `https://huggingface.co/settings/tokens`.

---

## 3. Backend AI Routes (`backend/src/routes/ai.ts`)

Mounted in `backend/src/app.ts` after the existing groups:
```ts
import aiRoutes from "./routes/ai";
app.use("/api/ai", aiRoutes);
```
Uses **Node 22 native `fetch`** (first HTTP-AI integration in the backend). Every handler: manual body validation → `try/catch` → pt-BR `{ error, details? }` (details only when `NODE_ENV !== "production"`, matching `master.ts`). **Auth:** each handler applies `requireAuth` from `backend/src/middleware/authMiddleware.ts:9` (the app is auth-gated via `RootLayoutProtected`, and the frontend already sends `Authorization: Bearer` via `authedFetch`/supabase session) — prevents the proxy from becoming an open relay and an unauthenticated key-validity oracle. Keys travel in the request body (never in OpenBand route URLs — the provider-facing calls like Gemini's `?key=` are required provider API shapes, not OpenBand URLs) and are **never logged or stored**. Express async handlers self-`try/catch` (no `express-async-errors`).

**Error mapping** — `mapProviderError(providerStatus: number): { status, error }`:
| Provider status | HTTP | Message (pt-BR) |
|---|---|---|
| 401 / 403 | 400 | "Chave de API inválida ou sem permissão." |
| 402 | 400 | "Sem créditos suficientes neste provedor." |
| 429 | 429 | "Limite de requisições atingido. Tente novamente em instantes." |
| 404 | 400 | "Modelo ou endpoint indisponível." |
| other non-2xx | 502 | "Falha no provedor de IA. Tente novamente." |

All outbound calls: HTTPS, `AbortController` timeout (image 120s, refine 60s, test-key 20s).

### 3.1 `POST /api/ai/test-key`
Body: `{ provider: AIProvider, apiKey: string }`. Provider validation endpoints:

| Provider | Call | Auth |
|---|---|---|
| gemini | `GET https://generativelanguage.googleapis.com/v1beta/models?key=<key>` | query param |
| openai | `GET https://api.openai.com/v1/models` | `Authorization: Bearer <key>` |
| openrouter | `GET https://openrouter.ai/api/v1/key` | `Authorization: Bearer <key>` |
| claude | `GET https://api.anthropic.com/v1/models` | `x-api-key: <key>` + `anthropic-version: 2023-06-01` |
| huggingface | `GET https://api-inference.huggingface.co/models` | `Authorization: Bearer <key>` |

Response: `200 { ok: true, message: "Chave funcionando!" }`. On non-2xx → `mapProviderError` → `{ ok: false, error }` (status 400/429/502).

### 3.2 `POST /api/ai/refine-prompt`
Body: `{ provider: "claude"|"gemini"|"openai"|"openrouter", apiKey, lyrics?: string, customPrompt?: string|null, projectTitle?: string, genre?: string }`
- `source = customPrompt?.trim() || lyrics?.trim()`; empty → `400 { error: "Nenhum texto para refinar." }`.
- System prompt (constant, pt-BR): *"Você é especialista em capas de álbuns musicais. Transforme a entrada em um prompt de imagem profissional (40–80 palavras) descrevendo cena, atmosfera, cores, iluminação e emoção. NUNCA inclua texto, palavras ou tipografia na imagem. Contexto: título '<title>', gênero '<genre>'."*
- Calls the refiner provider (see §1 table) and returns the assistant text:

| Provider | Call |
|---|---|
| claude | `POST https://api.anthropic.com/v1/messages` `{ model, max_tokens: 512, system, messages: [{ role: "user", content: source }] }` → `content[0].text` |
| gemini | `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent?key=<key>` `{ contents: [{ parts: [{ text: system + "\n\n" + source }] }] }` → `candidates[0].content.parts[*].text` |
| openai | `POST https://api.openai.com/v1/chat/completions` `{ model, messages: [{ role: "system", content: system }, { role: "user", content: source }] }` → `choices[0].message.content` |
| openrouter | `POST https://openrouter.ai/api/v1/chat/completions` (same shape as openai) → `choices[0].message.content` |

Response: `200 { refined: string }`.

### 3.3 `POST /api/ai/generate-cover`
Body: `{ provider: "gemini"|"openai"|"openrouter"|"huggingface", apiKey, prompt, model?, aspectRatio?: AspectRatio, quality?: "standard"|"high" }`
- Validate prompt non-empty → 400. `aspectRatio` defaults `"1:1"`; `model` defaults per §1.
- **Always append** the rule to the sent prompt: *"sem texto sobreposto na imagem"* (spec §6).

**Aspect-ratio → provider sizes** (`resolveImageSize(provider, aspectRatio)`):

| Ratio | gemini (imageConfig) | openai gpt-image-2 (`size`) | openai dall-e-3 (`size`) | huggingface (`width`×`height`) |
|---|---|---|---|---|
| 1:1 | `1:1` | `1024x1024` | `1024x1024` | 1024×1024 |
| 16:9 | `16:9` | `1536x1024` | `1792x1024` | 1344×768 |
| 9:16 | `9:16` | `1024x1536` | `1024x1792` | 768×1344 |
| 4:3 | `4:3` | `1024x1024` (fallback) | `1024x1024` (fallback) | 1024×768 |
| 3:4 | `3:4` | `1024x1024` (fallback) | `1024x1024` (fallback) | 768×1024 |

Provider calls:

| Provider | Call | Image extraction |
|---|---|---|
| gemini | `POST …/models/<model>:generateContent?key=<key>` body `{ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio } } }` | `candidates[0].content.parts[].inlineData.data` (base64) |
| openai | `POST https://api.openai.com/v1/images/generations` body `{ model, prompt, size, n: 1, response_format: "b64_json", quality }` | `data[0].b64_json` (base64) |
| openrouter | `POST https://openrouter.ai/api/v1/images/generations` body `{ model, prompt, n: 1, response_format: "b64_json", size }` | `data[0].b64_json` or `data[0].url` (fetch URL → buffer) |
| huggingface | `POST https://api-inference.huggingface.co/models/<model>` body `{ inputs: prompt, parameters: { width, height } }` | response body is raw binary → Buffer directly |

Response: **binary PNG** — `res.setHeader("Content-Type", "image/png")`, `res.setHeader("X-OpenBand-Aspect-Ratio", aspectRatio)`, `res.send(pngBuffer)`. On provider error → JSON via `mapProviderError`.

### 3.4 `POST /api/ai/generate-video` (optional, phase 2)
Body: `{ provider: "openai"|"openrouter", apiKey, prompt, aspectRatio?: "16:9"|"9:16", seconds?: number (2–10, default 4) }`
- openai (Sora): `POST https://api.openai.com/v1/videos` `{ model: "sora-2", prompt, size: ratio === "9:16" ? "720x1280" : "1280x720", duration: seconds }` → `{ id, status }`.
- Response: `200 { jobId: string, status: "pending" }`.
- Poll: `POST /api/ai/video/status` body `{ provider, apiKey, jobId }` (key in body, **never in the query string** — query strings are captured by Vercel/CDN/access logs) → provider `GET https://api.openai.com/v1/videos/:jobId` → `{ status: "processing"|"completed"|"failed", url?, error? }` (frontend polls every 5s). OpenRouter video = passthrough only if the provider exposes a compatible endpoint; otherwise `501 { error: "Vídeo não suportado neste provedor." }`.

---

## 4. Settings AI Screen (`app/settings-ai.tsx`)

Rendered inside `RootLayoutProtected` Stack (behind auth). Registered as `settings-ai` with `presentation: "modal"`.

Layout (top → bottom):
1. `PageHeader` title **"IA & Chaves de API"** + privacy card: *"Suas chaves ficam APENAS neste dispositivo. Elas nunca são armazenadas ou registradas nos servidores do OpenBand."*
2. One `Card` per provider (order §2), each containing:
   - Name + function tag (`Badge`): *"Imagem + Refinar"* (Gemini), *"Imagem + Vídeo"* (OpenAI), *"Imagens do mercado"* (OpenRouter), *"Apenas refinar prompt"* (Claude), *"Imagem gratuita"* (Hugging Face).
   - Short description + link **"Obter chave"** (`openURL(signupUrl)`, RN `Linking`).
   - `TextInput` `label="API Key"` `secureTextEntry` `autoCapitalize="none"` `autoCorrect={false}` — **saves to store on change** (`setAIKey`), not on blur (spec §5.2).
   - `Button` **"Testar chave"** (secondary, disabled while a test is running): `POST ${API_BASE_URL}/api/ai/test-key` with `{ provider, apiKey }` + `Authorization: Bearer` header (route is `requireAuth`-gated); shows `✓ <message>` (green) or `✕ <error>` (red) inline. A non-empty key is required to enable the button.
   - `Button` **"Apagar chave"** (ghost, only when a key exists): `removeAIKey(provider)`.
3. Defaults section: image provider + refiner provider selectors (chip grid) persisted via `setDefaults`.
4. Back button → `router.back()`.

Convention (existing): component classes `.card`, `.input-field`, `.btn-secondary`, `.btn-ghost`, `.badge` from `global.css`; `Button`/`Card`/`Badge`/`TextInput`/`Divider`/`PageHeader` from `src/components`.

---

## 5. `GenerateCoverModal` (`src/components/GenerateCoverModal.tsx`)

RN `<Modal>` directly (no generic modal component exists; matches `BounceDialog`/`Synth` pattern). Props:

```ts
interface GenerateCoverModalProps {
  visible: boolean;
  onClose: () => void;
  projectTitle: string;
  genre?: string;
  lyrics?: string;                    // initial value from project.lyrics
  onLyricsChange?: (text: string) => void; // persists edits to project.lyrics
  onUseAsCover: (coverDataUrl: string) => void; // studio persists project.coverUrl + closes
}
```

**State** (single `useState` cluster or `useReducer`):
- `sourceMode: AISource` (`"lyrics" | "custom"`)
- `lyricsText`, `customText`, `refinedPrompt` (editable `TextInput`/`TextArea`)
- `refinerProvider: RefinerProvider` (default `defaultPromptRefiner` if key present else first with key), `refining: boolean`
- `imageProvider` (default `defaultImageProvider` if key present else first with key), `model`, `aspectRatio` (default `"1:1"`), `quality`
- `generating: boolean`, `resultDataUrl: string | null`, `error: string | null`

**UI flow** (spec §5.4):
1. **No keys at all** → info card: *"Configure sua chave de IA primeiro"* + `Button` **"Configurar chaves"** → `router.push("/settings-ai")`; Generate disabled.
2. **Source tabs** — chips `Letra da música` / `Texto personalizado`. Lyrics tab: read-only-ish preview of `lyricsText` (or empty-state with a small textarea to paste the song lyrics → `onLyricsChange`). Custom tab: textarea.
3. **Refine section** — `Divider label="Refinar prompt"`; refiner chip selector (only providers with a key); `Button` **"✨ Deixar profissional"** → `POST /api/ai/refine-prompt` `{ provider: refinerProvider, apiKey, lyrics: lyricsText, customPrompt: customText, projectTitle, genre }` → result in the editable refined-prompt textarea (source becomes the refined text for generation). Errors shown inline; clear via editing.
4. **Settings** — `Divider label="Configurações"`; provider chips (**only providers with a key**); model chips (per §1 `IMAGE_MODELS`); aspect-ratio chips (`1:1`, `16:9`, `9:16`, `4:3`, `3:4`) labeled *Capa*, *YouTube*, *Reels*, *Post*, *Pinterest*; quality toggle (`standard`/`high`, only for openai).
5. **Generate** — `Button` **"🎨 Gerar capa"**: disabled when `generating`, when no prompt, or when the selected image provider has no key. Calls (auth header included — the route requires `requireAuth`; reuse the `authedFetch` helper from `src/lib/feedApi.ts:28-38` or attach `Authorization: Bearer` from the supabase session, but read the body as a `Blob`):
   ```ts
   const res = await fetch(`${API_BASE_URL}/api/ai/generate-cover`, {
     method: "POST",
     headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
     body: JSON.stringify({ provider, apiKey, prompt, model, aspectRatio, quality }),
   });
   const blob = await res.blob(); // binary PNG
   ```
   → convert to `data:image/png;base64,…` via `FileReader` (web/native) → `setResultDataUrl`. Non-2xx → parse `{ error }` → friendly inline error.
6. **Result** — image preview (`<Image source={{ uri: resultDataUrl }} />`, maintain ratio) + 3 buttons:
   - **"✅ Usar como Capa"** (primary) → `onUseAsCover(resultDataUrl)` (studio sets `project.coverUrl`, saves, closes modal).
   - **"🔄 Nova Versão"** (secondary) → re-run generation (same prompt, maybe `n` re-try).
   - **"💾 Baixar"** (ghost) → filename `<sanitized-project-title>.png` (spec §6). **Sanitize the project title first** (strip `/ \ : * ? " < > |`, control chars and whitespace runs; fallback `"capa"`) before composing the filename — titles are user input. Web: fetch again → `Blob` → `<a download=...>`; native/desktop: `OpenBandNative.showSaveDialog({ defaultPath: "<sanitized>.png", filters: [{ name: "PNG", extensions: ["png"] }] })` + `OpenBandNative.writeFile(path, arrayBuffer)`.

No external API is called when a provider lacks a key (spec §6). All fetches are self-`try/catch` with pt-BR error messages.

---

## 6. Studio Integration

- **`app/studio/hooks.ts`**: append `"generateCover"` to the `ModalId` union (line ~369) and add `generateCover: false` to the `useStudioModals` initial state (line ~409).
- **`app/studio/StudioModals.tsx`**: render
  ```tsx
  <GenerateCoverModal
    visible={modals.generateCover}
    onClose={() => closeModal("generateCover")}
    projectTitle={project.title}
    genre={project.genre}
    lyrics={project.lyrics}
    onLyricsChange={(t) => handleProjectLyricsChange(t)}
    onUseAsCover={(url) => handleUseAsCover(url)}
  />
  ```
  `handleUseAsCover` in `app/studio/[id].tsx`: `save({ ...project, coverUrl })` (via the existing `useStudioPersistence`/`save`) then `closeModal("generateCover")`. `handleProjectLyricsChange` similarly persists `project.lyrics`.
- **Button** in `app/studio/[id].tsx` header (next to the project title): `Button` variant `secondary`/`ghost` `title="✨ Gerar Capa com IA"` → `openModal("generateCover")`.

---

## 7. Cover Persistence & Rendering

- `src/lib/projectStore.ts`: add `coverUrl?: string` and `lyrics?: string` to `ProjectData` (interface only — optional, so existing persisted projects remain valid). `sanitizeProjectData` (lines ~198-260) passes both through (string-cast; ignore non-strings).
- `src/components/ProjectCard.tsx` (line ~41): **always** render `<Image source={{ uri: project.coverUrl }} />` in the thumbnail slot when `coverUrl` starts with `data:image/`, else keep the ♫ placeholder. This applies everywhere `ProjectCard` is used — including the library grid (`app/tabs/library.tsx`). There is no grid-vs-card distinction (resolves the earlier ambiguity): a single consistent rendering rule.
- **Storage / quota:** `coverUrl` is a base64 data URL (~1–3 MB at 1024px) persisted inside the project JSON. The ~5 MB localStorage origin budget is shared across all projects, so several covers can exhaust it. Mitigations:
  - `saveProject` currently **silently swallows** `QuotaExceededError` (`projectStore.ts:138-140`, only a `console.warn`). For the cover path specifically, propagate the failure: `saveProject` returns `false` on quota failure so `handleUseAsCover` can show an `Alert` ("Capa não salva: armazenamento cheio") instead of failing silently.
  - **Remix policy:** remix/duplicate-project copy (`projectStore.ts:319-324` and `createRemix`) **drops `coverUrl`** so multi-MB base64 strings are not duplicated per remix.
  - Future (out of scope): store covers as files via the bridge (`writeFile` under `getDocumentsPath()`) instead of inline base64; documented for a later change.

---

## 8. Security Rules (spec §6, enforced)

1. Keys are stored **only on-device**; they are **never persisted, logged, or committed on OpenBand servers**. During a generation call the key transits the OpenBand backend (HTTPS, in-memory, behind `requireAuth`) purely to be forwarded to the provider and is discarded immediately. (The source spec's literal "nunca enviada" is interpreted as "nunca armazenada/logada/commitada" — reconciled with the proxy architecture; flagged for product confirmation.)
2. Backend handlers must NOT log `req.body` (no `console.log` of request bodies).
3. Inputs use `secureTextEntry` / `type="password"`; autocomplete off.
4. All outbound calls HTTPS + timeout.
5. Claude never generates images/videos (backend rejects `provider: "claude"` on `/generate-cover` with 400).
6. Providers without a key are disabled/hidden in every selector.

---

## 9. Tests

| File | Covers |
|---|---|
| `tests/settingsStore.test.ts` | defaults (`defaultImageProvider: "gemini"`, `defaultPromptRefiner: "claude"`), `setAIKey` trims + persists, `removeAIKey` deletes, zustand `persist` rehydrates from `localStorage` mock |
| `tests/settingsAI.test.tsx` | 5 provider cards render in order; typing a key saves to store; "Testar chave" calls `/api/ai/test-key` and shows success/error (mock fetch per `tests/feedApi.test.ts:27-42` pattern); "Apagar chave" clears |
| `tests/generateCoverModal.test.tsx` | no-keys warning state; provider disabled without key; refine flow mocks `/refine-prompt` and fills the editable prompt; generate mocks `/generate-cover` blob and shows preview; error path shows friendly message; `onUseAsCover` fires with the data URL |
| `tests/projectCover.test.ts` | `sanitizeProjectData` preserves `coverUrl`/`lyrics`; `ProjectCard` renders `<Image>` when `coverUrl` present |
| `backend/src/routes/ai.test.ts` | standalone `node:assert` script (pattern: `storage.test.ts`) for pure helpers: `resolveImageSize` maps all 5 ratios × providers; `resolveModel` defaults; `mapProviderError` statuses; `/api/ai/test-key` + `/api/ai/generate-cover` reject `provider: "claude"` for images |

**Verification (AGENTS.md Phase 3):** `npx tsc --noEmit`; `cd backend && npx tsc --noEmit`; `npx vitest run`; `npm run test:legacy`; `npm run build`. Full verification is run by the implementing subagent before the final commit.

---

## 10. Risks / Notes
- **First HTTP-AI integration in backend** — no existing fetch/axios pattern; providers' exact 2026 endpoints/models (per product spec §1) are trusted as given; implementation agents should verify each endpoint against provider docs before finalizing (README links in `docs/AI_INTEGRATION_AGENT_SPEC.md` §9).
- **Global rate limiter** (`30 req/15 min`, `app.ts:134`) applies to `/api/ai/*`; acceptable for interactive use, but generation bursts (e.g. "Nova Versão" spamming) could 429 — the modal surfaces the mapped "rate limit" message.
- **`express.json({ limit: "1mb" })`** is sufficient (all payloads are small JSON); images return as binary, never in JSON.
- **OpenRouter image/video endpoints** may vary by model availability (e.g. `google/gemini-3.1-flash-image` on OpenRouter must be verified to exist); keep implementations defensive (fallback to `data[0].url` fetch when `b64_json` absent).
- **`requireAuth` on `/api/ai/*`** means the modal/screen fetches must send the supabase Bearer token; in mock/no-session dev, tests mock the auth header. If this blocks the local mock-auth flow, fall back to `optionalAuth` (permission tolerant) rather than removing auth entirely.
- The settings screen is behind auth (`RootLayoutProtected`); keys are device-local regardless of account.
