# Tasks — Vercel Frontend Performance (P2 remaining)

> **Status:** P0 (cache headers, logo, root imports) and P1 (post-export preload/splash, deferred feed previews) are **DONE and shipped** (`1026fb8 perf: Vercel first-load — cache headers, logo, root imports, preload, defer previews`). Canonical spec of shipped behavior: `openspec/specs/vercel-performance/spec.md`. This file tracks **only the open P2 work** below.

## P2 — Code splitting + housekeeping (gated)

### 6. Code splitting
- [x] Set `app.json:32` `web.output: "static"` AND add `export const unstable_settings = { render: "client-only" }` to data-driven routes (`app/tabs/index.tsx`, `app/tabs/library.tsx`, `app/tabs/moments.tsx`, `app/tabs/feed.tsx`, `app/studio/[id].tsx`, `app/mastering/index.tsx`, and any new auth-gated/modal routes e.g. `app/settings-ai.tsx`); OR enable Metro `experiments: { asyncRoutes: true }` in `metro.config.js` keeping `output: "single"` (subsumed by `openspec/changes/startup-lazy-loading` — shipped via `asyncRoutes` on web).
- [ ] **Gate:** land only if `npm run build` succeeds AND `npx vitest run` passes AND a Playwright smoke of `/`, `/tabs`, `/studio/:id` renders. If it fails, revert and rely on P0+P1 (already shipped).
- [ ] If landed: record new entry + route-chunk sizes (target ≥ 40% entry reduction).

### 7. Service-worker precache
- [ ] Precache the hashed entry JS/CSS at `install` in the SW source (`assets/sw.js`, copied to `dist/sw.js`); keep the activate-time cache cleanup.

### 8. Dead deps + icons (housekeeping)
- [ ] Remove `@react-three/fiber` and `@react-three/drei` from `package.json` (verified zero imports); `npm install`; confirm build.
- [ ] **Sequencing note:** `zustand` is currently installed only transitively via `@react-three/fiber`. The `ai-cover-generation` change adds `zustand` as an explicit dependency in the shared-file prep step (done BEFORE this task) — confirm `zustand` is in `package.json` `dependencies` before removing the r3f packages so nothing breaks.
- [ ] Compress `assets/icon.png` (393 KB) and `icon-512.png` (160 KB); remove/compress unused `public/logo-openband.png` (131 KB) if confirmed unreferenced.

## Verification (P2 gate, full pass before commit)
- [ ] `npx expo export -p web --clear` succeeds; entry bundle raw/gzip recorded (compare `spec.md` §2.3 baseline).
- [ ] `npx tsc --noEmit` clean.
- [ ] `npx vitest run` all pass (exit 0).
- [ ] `cd backend && npx tsc --noEmit` clean (only if backend files touched — not expected).
- [ ] Lighthouse mobile run on a deploy; LCP/TBT/CLS before/after recorded.
- [ ] `curl` cache-header checks still pass for `/`, `/_expo/static/...`, `/sw.js` (no regressions from P2).
