# Tasks — AI Cover Generation (BYOK)

> Order follows the product spec §7 and design §1–§9. Each task is implemented + verified by a `general` subagent; code review via the `code-review` subagent runs **before every commit**. Mark items `[x]` as they complete. The spec commit (this folder) is committed FIRST, before any source changes.

## 1. Dependency + project model
- [ ] Add `zustand` to `package.json` dependencies (currently transitive only); `npm install zustand`.
- [ ] `src/lib/projectStore.ts`: add `coverUrl?: string` and `lyrics?: string` to `ProjectData` (optional fields).
- [ ] `src/lib/projectStore.ts`: `sanitizeProjectData` preserves `coverUrl`/`lyrics` (string-cast, ignore non-strings).
- [ ] `src/components/ProjectCard.tsx`: render `<Image source={{ uri: project.coverUrl }} />` when `coverUrl` starts with `data:image/`, else keep the ♫ placeholder — **same rule everywhere** (library grid + any ProjectCard usage; no grid/card distinction).
- [ ] `src/lib/projectStore.ts`: `saveProject` returns `false` on `QuotaExceededError` (instead of silently swallowing at lines ~138-140) so the studio can alert the user; remix/duplicate-project copy drops `coverUrl` (do not duplicate multi-MB base64).

## 2. Settings store (`src/lib/settingsStore.ts`)
- [ ] Export `AIProvider`, `AspectRatio`, `AISource` types.
- [ ] `useSettingsAIStore` (zustand + persist, key `openband-ai-settings`): state `aiKeys`, `defaultImageProvider: "gemini"`, `defaultPromptRefiner: "claude"`; actions `setAIKey`, `removeAIKey`, `setDefaults`.
- [ ] Cross-platform storage adapter `aiStorage`: web/Electron → `localStorage`; native → `OpenBandNative.readFile`/`writeFile` of `ai-settings.json` under `getAppDataPath()`; degrade to in-memory with `console.warn` when unavailable.
- [ ] Export metadata: `AI_PROVIDERS` (order Gemini → OpenAI → OpenRouter → Claude → Hugging Face, each with `{ id, name, function, description, signupUrl }`), `IMAGE_MODELS`, `REFINER_MODELS`, `ASPECT_RATIOS`.
- [ ] Verify persistence: key survives store re-hydration in a unit test.

## 3. Backend AI routes (`backend/src/routes/ai.ts`)
- [ ] Mount in `backend/src/app.ts`: `app.use("/api/ai", aiRoutes)` (after line ~157). `requireAuth` is applied **per-handler**, not at mount (matches existing `storage.ts`/`auth.ts` pattern).
- [ ] `mapProviderError(status)` → pt-BR messages (401/403, 402, 429, 404, else 502). `resolveImageSize(provider, aspectRatio)` and `resolveModel(provider, model?, op)` pure helpers (unit-tested).
- [ ] `POST /test-key` — per-provider validation endpoints (§3.1 design); 20s AbortController; `{ ok: true, message }` / `{ ok: false, error }`. Handler is `requireAuth`-gated.
- [ ] `POST /refine-prompt` — source = `customPrompt || lyrics`; pt-BR system prompt; call claude/gemini/openai/openrouter (§3.2); 60s timeout; `{ refined }`. `requireAuth`.
- [ ] `POST /generate-cover` — reject `provider: "claude"` with 400; append "sem texto sobreposto na imagem" rule; call gemini/openai/openrouter/huggingface (§3.3); 120s timeout; return binary PNG with `Content-Type: image/png` + `X-OpenBand-Aspect-Ratio`. `requireAuth`.
- [ ] `POST /generate-video` + `POST /video/status` — OpenAI Sora job creation + polling (§3.4; key in **body**, never in query string). `requireAuth`. **Optional / phase 2**: implement only if time permits; otherwise leave route stubbed to 501 with a clear error.

## 4. Settings AI screen (`app/settings-ai.tsx`)
- [ ] Create route file; register `<Stack.Screen name="settings-ai" … presentation="modal" />` in `app/_layout.tsx`.
- [ ] Privacy card + `PageHeader` "IA & Chaves de API" (privacy wording per design §4: keys stored only on-device, never stored/logged on OpenBand servers).
- [ ] 5 provider cards (§4): Badge function tag, description, "Obter chave" `Linking.openURL(signupUrl)`, `secureTextEntry` key input (auto-save on change), "Testar chave" (calls `/api/ai/test-key` with `Authorization: Bearer`, inline ✓/✕ feedback), "Apagar chave" (visible only with key).
- [ ] Defaults section (image provider + refiner chips) via `setDefaults`.
- [ ] Add link row **"IA & Chaves de API"** in `app/tabs/settings.tsx` → `router.push("/settings-ai")`.

## 5. GenerateCoverModal (`src/components/GenerateCoverModal.tsx`)
- [ ] Component + props (§5): `{ visible, onClose, projectTitle, genre, lyrics, onLyricsChange, onUseAsCover }`; export from `src/components/index.ts`.
- [ ] State machine: sourceMode, lyricsText/customText/refinedPrompt, refinerProvider/refining, imageProvider/model/aspectRatio/quality, generating/resultDataUrl/error.
- [ ] No-keys warning state with "Configurar chaves" → `/settings-ai`.
- [ ] Source tabs (Letra / Texto), refine button "✨ Deixar profissional" → `/api/ai/refine-prompt` (editable result), settings chips (only providers with keys; model/aspect per §1), "🎨 Gerar capa" → `/api/ai/generate-cover` (disabled without prompt/key). All fetches send `Authorization: Bearer` (route is `requireAuth`-gated).
- [ ] Result: image preview + "✅ Usar como Capa" → `onUseAsCover(dataUrl)`; "🔄 Nova Versão" re-run; "💾 Baixar" → `<sanitized-title>.png` (web `<a download>`; native `showSaveDialog` + `writeFile`). Sanitize the title (strip `/ \ : * ? " < > |` + control chars, fallback "capa") before composing the filename.
- [ ] All fetches self-`try/catch` with friendly pt-BR errors; inline error display.

## 6. Studio integration
- [ ] `app/studio/hooks.ts`: add `"generateCover"` to `ModalId` union + `generateCover: false` in `useStudioModals` init.
- [ ] `app/studio/StudioModals.tsx`: render `GenerateCoverModal` with project props; wire `onLyricsChange`/`onUseAsCover`.
- [ ] `app/studio/[id].tsx`: "✨ Gerar Capa com IA" button (header, near title) → `openModal("generateCover")`; `handleUseAsCover` saves `project.coverUrl` via `useStudioPersistence.save` + closes — if `saveProject` returns `false` (quota), show an `Alert` instead of failing silently; `handleProjectLyricsChange` persists `project.lyrics`.

## 7. Docs
- [ ] Save the product spec verbatim as `docs/AI_INTEGRATION_AGENT_SPEC.md` (source of truth for business rules).
- [ ] Update `README.md` with a short "IA & Capas" section pointing to the spec + settings screen.
- [ ] Confirm `.gitignore` already excludes `.env`/`backend/.env` (it does — no change needed unless a gap is found).

## 8. Tests
- [ ] `tests/settingsStore.test.ts` — defaults, set/remove key, persist rehydrate.
- [ ] `tests/settingsAI.test.tsx` — 5 cards, auto-save, test-key success/error via mocked fetch (with auth header), delete.
- [ ] `tests/generateCoverModal.test.tsx` — no-keys state, disabled provider without key, refine flow, generate blob preview (mocked fetch with auth header), error display, `onUseAsCover`, filename sanitization.
- [ ] `tests/projectCover.test.ts` — sanitize preserves coverUrl/lyrics; ProjectCard renders Image; remix copy drops coverUrl; `saveProject` returns false on quota error.
- [ ] `backend/src/routes/ai.test.ts` — standalone `node:assert` script: `resolveImageSize` (5 ratios × providers), `resolveModel` defaults, `mapProviderError`, `/generate-cover` rejects claude.

## 9. Verification (run by implementing subagent, full pass before final commit)
- [ ] `npx tsc --noEmit` clean.
- [ ] `cd backend && npx tsc --noEmit` clean.
- [ ] `npx vitest run` all suites pass (node:test output format).
- [ ] `npm run test:legacy` passes.
- [ ] `npm run build` succeeds.
- [ ] Manual smoke (web): add a fake key in settings → test-key shows mapped error; generate with a valid key → preview → "Usar como Capa" → library card shows the cover.

## 10. Commit sequence
- [ ] **Commit 1 (spec only, before code):** this change folder (`openspec/changes/ai-cover-generation/*`) + `docs/AI_INTEGRATION_AGENT_SPEC.md` + README link. Message: `docs: spec AI cover generation (BYOK)`.
- [ ] **Commit 2 (implementation):** all source + tests + spec checkbox updates. Message: `feat: AI cover generation with BYOK providers`.
- [ ] Push to `master` (normal Vercel deploy).
