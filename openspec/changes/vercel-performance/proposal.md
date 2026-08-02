# Proposal — Vercel Frontend Performance

## Context
The OpenBand web app is exported as a static site (`expo export -p web`, output `dist/`, deployed on Vercel via `vercel.json`) and users report the deployed frontend loads **"veeeeery slow"**. A performance audit was completed and found the root causes (all measured against the current `dist/` export):

| # | Bottleneck | Evidence |
|---|---|---|
| 1 | **Single monolithic JS bundle** | Exactly **one** JS file: `dist/_expo/static/js/web/entry-*.js` = **2,614 KB raw / 692.6 KB gzip**. `app.json:32` sets `"web": { "bundler": "metro", "output": "single" }`, so Expo bundles **all ~30 routes + all 76 components** into one chunk (zero dynamic-import chunks in the Metro static export) |
| 2 | **Root barrel import pulls heavy modules into the root-critical-path module graph** | `app/_layout.tsx:10` `import { Loading, ToastProvider } from "../src/components"` → the barrel `src/components/index.ts` statically re-exports all 76 exports, so `soundfont-player` (via `PianoRoll`→`midiSynth`), `lamejs` (via `audio.ts`), supabase, i18next are reachable from the root module graph. **Note (bundling model):** under `output: "single"` there is exactly one chunk, so this does NOT reduce initial-transfer bytes today — it removes root-module side effects, keeps the core lean once code splitting lands, and is a precondition for any tree-shaking win. The ≥40% size reduction is only reachable via P2 code splitting. |
| 3 | **988 KB logo rendered at 56×56** | `src/components/Sidebar.tsx:27` requires `assets/logo-dark.png` (988.7 KB PNG) and renders it at 56×56 px on every desktop load (`app/tabs/_layout.tsx:90-98`). ~55% of first-load transfer for a 56 px logo |
| 4 | **No cache headers on hashed assets** | `vercel.json` has no `headers`. Vercel serves `/_expo/static/**` with `Cache-Control: public, max-age=0, must-revalidate`, so the 692 KB gz JS + CSS are **revalidated on every visit** even though filenames are content-hashed (safe to mark immutable) |
| 5 | **Cold-start Express function on every fresh visit** | `api/index.ts` mounts the **entire** Express backend (`backend/src/app.ts` — ~20 routers, `better-sqlite3`, `google-auth-library`). `AuthContext.tsx:139` `fetchTier()` → `GET /api/user/tier` and `app/tabs/index.tsx` `loadFeed()` → `/api/feed` both hit the cold function on first visit; user stares at skeletons for 1–5 s |
| 6 | **No preload / preconnect / loading UI** | `dist/index.html` has no `<link rel="preload">` for the entry JS, no `preconnect` for the three CDNs in `src/lib/loadThree.ts:14-18`, and an empty `#root` (blank page until the 692 KB gz bundle parses + auth resolves) |

## Objectives
Make first load on Vercel dramatically faster, measured before/after:

- **P0** (safe, high impact): immutable caching headers for hashed static assets; replace the 988 KB logo with a ≤ ~30 KB image; narrow root barrel imports to direct file imports (hygiene — root-module cleanliness, enabler for P2; **not** a transfer-size reduction under `output: "single"`).
- **P1** (low risk): preload entry JS + preconnect to 3D CDNs + inline loading UI via `scripts/post-export.js` (post-export HTML rewrite); defer the 6 feed-preview `OfflineAudioContext` renders on `app/tabs/index.tsx`.
- **P2** (bigger lever, needs verification): enable per-route code splitting (`web.output: "static"` or Metro `asyncRoutes`) so heavy DAW/3D/mixer routes load on demand; service-worker install-time precache; remove dead deps (`@react-three/fiber`, `@react-three/drei` — never imported).

Backend cold-start mitigation is **documented but optional** (split serverless functions / response caching) — not required for this change.

## Scope
**M** — config + asset + import-path changes, one new `app/+html.tsx`, small backend-agnostic edits. No new dependencies. All changes are reversible and verified against the existing vitest suite + `npm run build`.

## Out of Scope
- Rewriting the app or the Express backend into a microservice architecture.
- React Native/native (iOS/Android) performance (web/Vercel only).
- New performance tooling dependencies (measurement uses existing `expo export` output, `curl`, and Lighthouse).
