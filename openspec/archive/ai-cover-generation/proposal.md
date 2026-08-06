# Proposal — AI Cover Generation (BYOK)

## Context
OpenBand has no AI image/video generation and no per-user API-key management. The backend (`backend/src/`) performs zero outbound HTTP calls to third-party AI providers today — heavy work is done locally (ffmpeg, Demucs) and the only external SDK is `google-auth-library` for OAuth. There is also **no project cover image** anywhere in the product: `ProjectData` (`src/lib/projectStore.ts:15-38`) has no cover/artwork field, `ProjectCard` renders a static ♫ placeholder, and no screen offers a cover upload.

The product owner supplied a detailed technical spec (to be saved at `docs/AI_INTEGRATION_AGENT_SPEC.md`) defining a **Bring-Your-Own-Key (BYOK)** model: the user stores their own AI provider keys locally on-device; the OpenBand backend only proxies calls to providers (Gemini, OpenAI, OpenRouter, Claude, Hugging Face). This keeps the business model at **zero cost to CPX Labs** — keys are stored **only on-device** and are **never persisted, logged, or committed on OpenBand servers**. During a generation call the key transits the OpenBand backend per-request (HTTPS, in-memory only) purely to be forwarded to the chosen provider; it is discarded immediately. (Security wording reconciled with the proxy design — see §8.)

## Reality Deviations (spec vs codebase)
The provided spec assumes several things that do not match the actual repo. This change adapts the spec to reality:

| Spec assumption | Actual codebase | Adaptation |
|---|---|---|
| `src/pages/SettingsAI.tsx` | No `src/pages/`; expo-router `app/` routes | Screen lives at `app/settings-ai.tsx`, registered in the root Stack (`app/_layout.tsx:41-53`) |
| `src/pages/ProjectView.tsx` with existing cover upload | Project screen is `app/studio/[id].tsx` (DAW); **no cover upload exists** | Button added to studio; `coverUrl` field added to `ProjectData` |
| Store with zustand + persist | No zustand in `src/` (module stores + Context + localStorage/bridge) | Add `zustand` as a direct dependency (per spec; it is currently installed only transitively — the `vercel-performance` change removes `@react-three/fiber`, which would drop zustand, so it must be added as an explicit dependency in the shared-file prep step) |
| Modify `backend/src/index.ts` to register routes | Routes are registered in `backend/src/app.ts:136-157` | Mount `/api/ai` in `backend/src/app.ts` |
| "Letra da música (auto-importada do projeto)" | No lyrics field exists in `ProjectData` | Add `lyrics?: string` to `ProjectData`; modal pre-fills from it and saves edits |

## Problem Description
- Users cannot generate album art / marketing art / videos without leaving the app.
- There is no key configuration screen, no way to validate a key, and no persistence of keys on-device.
- The backend has no AI proxy routes, no prompt-refinement pipeline, and no error mapping for provider failures (invalid key / no credits / rate limit / model unavailable).
- A generated cover has nowhere to live: the project model has no cover field and the library cannot render one.

## Objectives
- Add a **BYOK settings store** (`src/lib/settingsStore.ts`, zustand + persist, storage key `openband-ai-settings`) for the 5 providers' keys + default provider/model/refiner preferences.
- Add a **Settings AI screen** (`app/settings-ai.tsx`): per-provider key add / test (`POST /api/ai/test-key`) / delete, with privacy explanation and disabled-state fallbacks.
- Add backend AI proxy routes (`backend/src/routes/ai.ts`, mounted at `/api/ai`):
  - `POST /test-key` — validate a key against any of the 5 providers.
  - `POST /refine-prompt` — transform lyrics/custom text into a professional album-art prompt (Claude → Gemini → OpenAI → OpenRouter).
  - `POST /generate-cover` — generate an image (Gemini → OpenAI → OpenRouter → Hugging Face) in industry standard aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4), returns binary PNG.
  - `POST /generate-video` + `POST /video/status` — OpenAI Sora / OpenRouter video generation with job polling (**optional, phase 2**).
- Add a **`GenerateCoverModal`** component (`src/components/GenerateCoverModal.tsx`) wired into the studio screen (`app/studio/[id].tsx`) with a "✨ Gerar Capa com IA" button: lyrics/custom text source → optional refine → provider/model/aspect picker → preview → *Usar como Capa* / *Nova Versão* / *Baixar*.
- Persist the approved cover: add `coverUrl?: string` and `lyrics?: string` to `ProjectData`, update `sanitizeProjectData`, and render the cover in `ProjectCard`.
- Add a link to the Settings AI screen from `app/tabs/settings.tsx`.
- Save the product spec at `docs/AI_INTEGRATION_AGENT_SPEC.md`.

## Scope
**L** — one new store, one new screen, four new backend routes with 5 external providers (first HTTP-AI integration in the backend), one new modal, project-model extension (`coverUrl`, `lyrics`), library rendering, plus tests.

## Out of Scope
- In-app image editing, text-overlay templates on artwork.
- Unlimited generation history / gallery.
- Direct social sharing.
- A CPX Labs master key (always the user's own key).
- Tier/feature gating of AI generation (no `requireFeature` changes; free for all tiers).
- Persisting any provider key on OpenBand servers (explicitly forbidden by the spec).
