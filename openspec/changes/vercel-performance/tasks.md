# Tasks — Vercel Frontend Performance

> Order = lowest risk first. Each item is implemented + verified by a subagent; measure before/after at each P0 step; `code-review` before every commit. Mark `[x]` as done.

## P0 — Safe wins (do first)

### 1. Cache headers (`vercel.json`)
- [ ] Add the `headers` block from design §1 (immutable for `/_expo/static/**` and `/assets/**`; `no-cache` for `sw.js` + `manifest.json`; `s-maxage=600` for `/`).
- [ ] Verify after deploy: `curl -sI https://<deploy>/_expo/static/js/web/entry-*.js` shows `Cache-Control: public, max-age=31536000, immutable`.

### 2. Logo asset
- [ ] Replace `assets/logo-dark.png` (988 KB) with an optimized ≤128 px version (~5–30 KB); keep the `require("../../assets/logo-dark.png")` path in `src/components/Sidebar.tsx:27` working.
- [ ] Verify sidebar logo renders correctly at 56×56 in the app + storybook.

### 3. Narrow root imports
- [ ] `app/_layout.tsx:10`: replace `import { Loading, ToastProvider } from "../src/components"` with direct imports (`../src/components/Loading`, `../src/components/Toast`).
- [ ] `app/tabs/_layout.tsx:7`: replace the barrel import with direct imports (`Sidebar`, `ErrorBoundary`, `MiniPlayer`).
- [ ] Confirm no other `src/components` (barrel) import remains in `app/_layout.tsx` or `app/tabs/_layout.tsx`.
- [ ] Note: under `output: "single"` this is **hygiene** (root-module cleanliness), not a transfer-size reduction; the entry-size target belongs to P2 code splitting (task 6).

## P1 — Low-risk wins

### 4. Preload / preconnect / splash (`scripts/post-export.js` primary)
- [ ] **Primary:** extend `scripts/post-export.js` to rewrite `dist/index.html` after export: `<link rel="preload" as="script">` for the hashed entry JS (hash read from `dist/_expo/static/js/web/`), `preconnect` to `unpkg.com`/`cdnjs.cloudflare.com`/`cdn.jsdelivr.net`, `dns-prefetch`.
- [ ] Inject a minimal inline splash into `<div id="root">` (via `post-export.js`).
- [ ] **Optional (only if proven under `output: "single"`):** add `app/+html.tsx` with the same tags; otherwise keep post-export as the single source of truth.
- [ ] Verify `npm run build` output `dist/index.html` contains the preload/preconnect tags.

### 5. Defer feed previews (`app/tabs/index.tsx`)
- [ ] Gate the 6 `preloadPreview()` calls (~lines 133-141) behind `requestIdleCallback` with a `setTimeout(…, 1500)` fallback; skip on non-web.
- [ ] Verify feed previews still populate (existing vitest + manual).

## P2 — Code splitting + housekeeping (gated)

### 6. Code splitting
- [ ] Set `app.json:32` `web.output: "static"` AND add `export const unstable_settings = { render: "client-only" }` to data-driven routes (`app/tabs/index.tsx`, `app/tabs/library.tsx`, `app/tabs/moments.tsx`, `app/tabs/feed.tsx`, `app/studio/[id].tsx`, `app/mastering/index.tsx`, and any new auth-gated/modal routes e.g. `app/settings-ai.tsx`); OR enable Metro `experiments: { asyncRoutes: true }` in `metro.config.js` keeping `output: "single"`.
- [ ] **Gate:** land only if `npm run build` succeeds AND `npx vitest run` passes AND a Playwright smoke of `/`, `/tabs`, `/studio/:id` renders. If it fails, revert and rely on P0+P1.
- [ ] If landed: record new entry + route-chunk sizes (target ≥ 40% entry reduction).

### 7. Service-worker precache
- [ ] Precache the hashed entry JS/CSS at `install` in the SW source (`public/sw.js`/`assets/sw.js`) so 2nd visits are instant; keep the activate-time cache cleanup.

### 8. Dead deps + icons (housekeeping)
- [ ] Remove `@react-three/fiber` and `@react-three/drei` from `package.json` (verified zero imports); `npm install`; confirm build.
- [ ] **Sequencing note:** `zustand` is currently installed only transitively via `@react-three/fiber`. The `ai-cover-generation` change adds `zustand` as an explicit dependency in the shared-file prep step (done BEFORE this task) — confirm `zustand` is in `package.json` `dependencies` before removing the r3f packages so nothing breaks.
- [ ] Compress `assets/icon.png` (393 KB) and `icon-512.png` (160 KB); remove/compress unused `public/logo-openband.png` (131 KB) if confirmed unreferenced.

## Verification (full pass before final commit)
- [ ] `npx expo export -p web --clear` succeeds; entry bundle raw/gzip recorded (compare §3/§6 baselines).
- [ ] `npx tsc --noEmit` clean.
- [ ] `npx vitest run` all pass (exit 0 — also fixed by the `ci-workflow-fix` change).
- [ ] `cd backend && npx tsc --noEmit` clean (only if backend files touched — not expected).
- [ ] Lighthouse mobile run on a deploy; LCP/TBT/CLS before/after recorded.
- [ ] `curl` cache-header checks pass for `/`, `/_expo/static/...`, `/sw.js`.

## Commits
- [ ] **Commit (spec only):** `openspec/changes/vercel-performance/*`. Message: `docs: spec Vercel frontend performance (cache, bundle, imports, preload)`.
- [ ] **Commit (implementation):** P0+P1 as one commit (`perf: Vercel first-load — cache headers, logo, root imports, preload, defer previews`); P2 code-splitting as a separate reviewable commit only if the gate passes.
- [ ] Push to `master`; confirm Vercel deploy succeeds and the measured improvements hold on the deployed URL.
