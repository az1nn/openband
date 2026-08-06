# OpenSpec: Vercel Frontend Performance Specification

This document is the Source of Truth for the performance work that optimizes the OpenBand web app's first load on Vercel. It records the **shipped** P0 + P1 behavior and explicitly marks the gated P2 work as **not implemented**.

The deployed frontend is a static export (`expo export -p web` → `dist/`, deployed on Vercel via `vercel.json`). The original audit found six bottlenecks: a single monolithic JS bundle, a root barrel import pulling heavy modules into the root-critical-path module graph, a 988 KB logo rendered at 56×56, no cache headers on hashed assets, a cold-start Express function on every fresh visit, and no preload/preconnect/loading UI.

---

## 1. Overview & Objectives

Make first load on Vercel dramatically faster. The work is split into two shipped buckets and one gated bucket:

- **P0 (shipped, safe, high impact):** immutable caching headers for hashed static assets; replace the 988 KB logo with a ~4.6 KB image; narrow root barrel imports to direct file imports (root-module hygiene — not a transfer-size win under `output: "single"`).
- **P1 (shipped, low risk):** preload entry JS + preconnect/dns-prefetch + inline loading splash via `scripts/post-export.js`; defer the feed-preview `OfflineAudioContext` renders on the feed.
- **P2 (NOT implemented — gated):** per-route code splitting (`web.output: "static"` or Metro `asyncRoutes`), service-worker install-time precache, and dead-dependency/icon housekeeping. These remain open and land only if the build + vitest + e2e gate passes.

---

## 2. Implementation Notes

### 2.1. Immutable cache headers (`vercel.json`)

`vercel.json` now ships a `headers` block. Content-hashed assets are cached forever at the edge and browser; the SPA shell, service worker, and manifest revalidate.

```json
"headers": [
  { "source": "/_expo/static/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
  { "source": "/assets/(.*)",       "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
  { "source": "/sw.js",             "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
  { "source": "/manifest.json",     "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
  { "source": "/",                  "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, s-maxage=600" }] }
]
```

Repeat visits stop revalidating the gzip JS + CSS; the CDN edge caches `index.html` for 10 minutes (`s-maxage=600`).

### 2.2. Optimized logo asset

`assets/logo-dark.png` was replaced with an optimized ≤128 px PNG (~4.6 KB, down from 988 KB). The `require("../../assets/logo-dark.png")` path in `src/components/Sidebar.tsx` is unchanged so no component logic changed. The sidebar renders the logo at 56×56.

### 2.3. Narrow root imports (hygiene)

`app/_layout.tsx` and `app/tabs/_layout.tsx` now import from direct component files instead of the `src/components` barrel, removing a static reference to all 76 component exports from the root module graph. **This is hygiene, not a transfer-size reduction** while `web.output` is `"single"`; the ≥40% entry reduction target belongs to P2 code splitting. Rule: never import from `src/components/index.ts` in `app/_layout.tsx` or `app/tabs/_layout.tsx` (the barrel stays only for tests/stories/feature screens).

### 2.4. Post-export preload / preconnect / splash (`scripts/post-export.js`)

The build command runs `expo export -p web && node scripts/post-export.js`. `scripts/post-export.js` rewrites `dist/index.html` after export (`app/+html.tsx` was NOT used — post-export is the single source of truth): it inserts

- `<link rel="preload" as="script" href="/_expo/static/js/web/<entry-hash>.js">` — the entry hash is read deterministically from `dist/_expo/static/js/web/`;
- `preconnect` + `dns-prefetch` to `unpkg.com`, `cdnjs.cloudflare.com`, `cdn.jsdelivr.net` (the three CDN fallbacks in `src/lib/loadThree.ts`);
- a minimal inline splash spinner (`OpenBand`) injected into `<div id="root">` so the perceived LCP improves before JS parses. Splash + link blocks are wrapped in `<!-- post-export:* -->` comment markers so re-export is idempotent.

### 2.5. Deferred feed previews (`app/tabs/index.tsx`)

The 6 `preloadPreview()` calls in the feed (`app/tabs/index.tsx`) are gated behind `requestIdleCallback` (with a `setTimeout(…, 1500)` fallback for browsers without it, marked skipped entirely when not web) so the `OfflineAudioContext` renders defer past first paint. Previews still populate after idle / first interaction.

---

## 3. Requirements

### 3.1. Cache & asset headers (shipped)
- [x] `/_expo/static/**` served with `Cache-Control: public, max-age=31536000, immutable`.
- [x] `/assets/**` served with `Cache-Control: public, max-age=31536000, immutable`.
- [x] `/sw.js` and `/manifest.json` served with `Cache-Control: no-cache`.
- [x] `/` served with `Cache-Control: public, max-age=0, s-maxage=600`.

### 3.2. Logo asset (shipped)
- [x] `assets/logo-dark.png` is an optimized ≤128 px PNG of ~4.6 KB (replacing the 988 KB PNG).
- [x] The `require("../../assets/logo-dark.png")` path in `src/components/Sidebar.tsx` still works and renders at 56×56 in app + storybook.

### 3.3. Narrow root imports (shipped)
- [x] `app/_layout.tsx` imports components directly (no `src/components` barrel import).
- [x] `app/tabs/_layout.tsx` imports components directly (no `src/components` barrel import).
- [x] No other barrel import from `src/components` remains in the root layout files.

### 3.4. Post-export preload / preconnect / splash (shipped)
- [x] `dist/index.html` contains `<link rel="preload" as="script">` for the hashed entry JS.
- [x] `dist/index.html` contains `preconnect` + `dns-prefetch` for `unpkg.com`, `cdnjs.cloudflare.com`, `cdn.jsdelivr.net`.
- [x] `dist/index.html` contains an inline splash spinner injected into `<div id="root">`.
- [x] Rewrites are idempotent (blocks are removed before re-injection).

### 3.5. Deferred feed previews (shipped)
- [x] The 6 `preloadPreview()` calls are gated behind `requestIdleCallback` with a `setTimeout(…, 1500)` fallback, and skipped on non-web.
- [x] Feed previews still populate (verified by vitest + manual).

### 3.6. NOT implemented / future (P2 — gated)
- [ ] **Code splitting:** `web.output` remains `"single"` in `app.json` (NOT switched to `"static"`); no `unstable_settings = { render: "client-only" }`; Metro `asyncRoutes` NOT enabled. Land only if `npm run build` succeeds AND `npx vitest run` passes AND a Playwright smoke of `/`, `/tabs`, `/studio/:id` renders.
- [ ] **Service-worker precache:** `assets/sw.js` (→ `dist/sw.js`) does NOT precache hashed entry JS/CSS at `install`.
- [ ] **Dead deps + icons:** `@react-three/fiber`, `@react-three/drei` NOT removed; `assets/icon.png` (393 KB) and `asset-512.png` (160 KB) NOT yet compressed; unused `public/logo-openband.png` NOT removed.

---

## 4. Verification

- [x] `curl` cache-header checks pass for `/`, `/_expo/static/...`, `/sw.js` (immutable/no-cache/s-maxage).
- [x] `npm run build` succeeds; `dist/index.html` contains preload/preconnect tags; post-export idempotent.
- [x] `npx tsc --noEmit` and `npx vitest run` pass.
- [ ] P2 gate: entry bundle transfer/parse reduced ≥ 40% (code splitting) BEFORE landing.
- [ ] P2 gate: Lighthouse mobile LCP/TBT/CLS before/after recorded.