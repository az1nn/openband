# Tasks — Vercel Frontend Performance (P2 remaining)

> **Status:** P0 (cache headers, logo, root imports) and P1 (post-export preload/splash, deferred feed previews) are **DONE and shipped** (`1026fb8 perf: Vercel first-load — cache headers, logo, root imports, preload, defer previews`). Canonical spec of shipped behavior: `openspec/specs/vercel-performance/spec.md`. This file tracks **only the open P2 work** below.

## P2 — Code splitting + housekeeping (gated)

### 6. Code splitting
- [x] Set `app.json:32` `web.output: "static"` AND add `export const unstable_settings = { render: "client-only" }` to data-driven routes (`app/tabs/index.tsx`, `app/tabs/library.tsx`, `app/tabs/moments.tsx`, `app/tabs/feed.tsx`, `app/studio/[id].tsx`, `app/mastering/index.tsx`, and any new auth-gated/modal routes e.g. `app/settings-ai.tsx`); OR enable Metro `experiments: { asyncRoutes: true }` in `metro.config.js` keeping `output: "single"` (subsumed by `openspec/changes/startup-lazy-loading` — shipped via `asyncRoutes` on web).
- [x] **Gate:** `npm run build` succeeds, `npx vitest run` passes (1479/1479), `npx tsc --noEmit` clean. Playwright smoke config exists at `e2e/` (run locally before deploy).
- [x] Record new entry + route-chunk sizes: entry `1114 KB raw / 288 KB gzip`; largest route chunks `[id]` 79 KB, `index` 168 KB (see `openspec/specs/vercel-performance/spec.md` §2.6). Entry reduction target met via route splitting.

### 7. Service-worker precache
- [x] Precache the hashed entry JS/CSS at `install` in the SW source (`assets/sw.js`, copied to `dist/sw.js`); keep the activate-time cache cleanup.

### 8. Dead deps + icons (housekeeping)
- [x] Remove `@react-three/fiber` and `@react-three/drei` from `package.json` (verified zero imports); `npm install`; confirm build.
- [x] **Sequencing note:** `zustand` is an explicit `dependencies` entry (`^5.0.14`) — confirmed present before r3f removal; nothing depends on the transitive path.
- [x] Compress `assets/icon.png` (393 KB) and `icon-512.png` (160 KB); remove/compress unused `public/logo-openband.png` (131 KB) if confirmed unreferenced.

## Verification (P2 gate, full pass before commit)
- [x] `npx expo export -p web --clear` succeeds; entry bundle raw/gzip recorded (see `spec.md` §2.6 — 1114 KB raw / 288 KB gzip).
- [x] `npx tsc --noEmit` clean.
- [x] `npx vitest run` all pass (1479/1479, exit 0).
- [x] `cd backend && npx tsc --noEmit` clean.
- [ ] Lighthouse mobile run on a deploy; LCP/TBT/CLS before/after recorded (requires a deploy).
- [ ] `curl` cache-header checks on a deploy (no regressions from P2).
