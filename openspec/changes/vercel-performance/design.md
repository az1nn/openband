# Design — Vercel Frontend Performance

## File / Requirement Mapping

| Change | File | Details |
|---|---|---|
| Immutable cache headers | `vercel.json` | add `headers` block (below) |
| Compress logo | `assets/logo-dark.png` (+ `src/components/Sidebar.tsx` if path/name changes) | replace 988 KB PNG with optimized ≤128 px asset (~5–30 KB); keep the `require("../../assets/logo-dark.png")` path working |
| Narrow root imports | `app/_layout.tsx` (line 10), `app/tabs/_layout.tsx` (line 7) | replace barrel imports with direct file imports: `../src/components/Loading`, `../src/components/Toast`, `../src/components/Sidebar`, `../src/components/ErrorBoundary`, `../src/components/MiniPlayer` |
| Preload + preconnect + loading UI | `app/+html.tsx` (new) | `<link rel="preload">` entry JS, `preconnect` to `unpkg.com`/`cdnjs.cloudflare.com`/`cdn.jsdelivr.net`, inline splash spinner in `#root` |
| Defer preview renders | `app/tabs/index.tsx` (lines ~133-141) | gate the 6 `preloadPreview()` calls behind `requestIdleCallback` (fallback `setTimeout(…, 1500)`) |
| Code splitting (P2) | `app.json` (line 32), `metro.config.js`, per-route `unstable_settings` | `web.output: "static"` (with `unstable_settings = { render: "client-only" }` on data-driven routes) OR Metro `experiments: { asyncRoutes: true }`; verify full build + e2e before landing |
| SW precache (P2) | `public/sw.js` / `assets/sw.js` (source of `dist/sw.js`) | precache hashed entry JS/CSS at `install` |
| Remove dead deps (P2) | `package.json` | drop `@react-three/fiber`, `@react-three/drei` (grep confirms zero imports) |
| Backend cold-start notes (optional) | `backend/src/app.ts`, `vercel.json` | documented guidance only; no code required for this change |

## 1. Immutable caching headers (`vercel.json`)

Hashed filenames are safe to cache forever; `index.html`, `sw.js`, `manifest.json` must revalidate.

```json
"headers": [
  { "source": "/_expo/static/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
  { "source": "/assets/(.*)",       "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
  { "source": "/sw.js",             "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
  { "source": "/manifest.json",     "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
  { "source": "/",                  "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, s-maxage=600" }] }
]
```

Impact: repeat visits stop revalidating the ~692 KB gz JS + 48 KB CSS; CDN edge caches `index.html` for 10 min. **Verify** the `"/"` rule actually matches the served SPA shell given the catch-all rewrite `/:path* → /` (`vercel.json:13`); if it does not, broaden the source (e.g. `"/index.html"` or `/(.*)` scoped to HTML) after checking it does not clash with the immutable rules.

## 2. Logo asset

Replace `assets/logo-dark.png` with a compressed version of the same logo at ≤128 px. **Keep it a PNG** (the `require` path stays `.png` and RN `Image` on native should not decode a mislabeled WebP). Keep the `require` path in `src/components/Sidebar.tsx:27` unchanged so no component logic changes. Expected saving ≈ 950 KB on every desktop load. Verify the sidebar renders correctly at 56×56.

## 3. Narrow root imports (hygiene — not a size win under `output: "single"`)

`app/_layout.tsx` currently imports the whole component barrel for just `Loading` + `ToastProvider`; `app/tabs/_layout.tsx` imports `MiniPlayer`, `Sidebar`, `ErrorBoundary` from the barrel. Replace with direct file imports so the root module graph no longer statically references every component. **Expected effect:** removes root-module side effects and keeps the core lean; it does **not** reduce the single entry chunk's transfer bytes while `output: "single"` is active (that target belongs to P2). **Rule going forward:** never import from `src/components/index.ts` (the barrel) in `app/_layout.tsx` or `app/tabs/_layout.tsx`; the barrel stays for tests/stories/feature screens.

## 4. Preload / preconnect / splash (`scripts/post-export.js` primary, `app/+html.tsx` optional)

`app/+html.tsx` is expo-router's document-customization mechanism, but it is **not guaranteed to be honored under `web.output: "single"`**. Implementation order:

1. **Primary:** extend `scripts/post-export.js` (already runs in the build command, `package.json:71`) to rewrite `dist/index.html` after export with:
   - `<link rel="preload" as="script" href="/_expo/static/js/web/<entry-hash>.js">` (hash read from the exported `dist/_expo/static/js/web/` directory — deterministic, no build-flag plumbing).
   - `<link rel="preconnect" href="https://unpkg.com">` + `https://cdnjs.cloudflare.com` + `https://cdn.jsdelivr.net` (the three `loadThree.ts` fallbacks) and `dns-prefetch`.
   - A minimal inline splash (spinner/text) injected into `<div id="root">` so LCP-perceived load improves before JS parses.
2. **Only if a quick check proves it works under `output: "single"`:** additionally use `app/+html.tsx` for the same tags. Otherwise keep post-export as the single source of truth.

## 5. Defer feed previews (`app/tabs/index.tsx`)

The `preloadPreview()` × 6 loop (lines ~133-141) runs 6 `OfflineAudioContext` renders (~3 s each) immediately after mount, competing with first paint. Wrap the loop in `requestIdleCallback` (with `setTimeout(…, 1500)` fallback for browsers without it, and skip entirely on non-web). Previews still populate, just after first interaction.

## 6. P2 — Code splitting (gated)

- Preferred: set `app.json:32` `"web": { "bundler": "metro", "output": "static" }` and add `export const unstable_settings = { render: "client-only" }` to data-driven routes (`app/tabs/index.tsx`, `app/tabs/library.tsx`, `app/tabs/moments.tsx`, `app/tabs/feed.tsx`, `app/studio/[id].tsx`, `app/mastering/index.tsx`, and any new auth-gated/modal routes such as `app/settings-ai.tsx`). Alternative: keep `output: "single"` and enable Metro `experiments: { asyncRoutes: true }` in `metro.config.js` (SDK 57).
- **Land only if** `npm run build` succeeds AND `npx vitest run` still passes AND a Playwright smoke of `/`, `/tabs`, `/studio/:id` renders. If either fails, revert to the P0+P1 improvements (they are the bulk of the win and are risk-free).
- AGENTS.md config-file constraint: `app.json`/`metro.config.js` changes are explicit requirements of this task, so they are permitted; they must be the **last** change implemented and reviewed.

## 7. Measurement (before / after gate)

| Metric | How to measure |
|---|---|
| Entry bundle size | `npx expo export -p web --clear` prints per-bundle sizes; record `entry-*.js` raw + gzip before/after |
| Cache headers | `curl -sI https://<deploy>.vercel.app/_expo/static/js/web/entry-*.js` → expect `immutable` |
| First-load transfer | DevTools Network (Disable cache) total gz bytes |
| LCP / TBT / CLS | `npx lighthouse <url> --mobile` before/after each P0/P1 change |
| Cold start | Forced-scale-to-zero function (or wait ≥ function idle timeout), then `curl -sI -o /dev/null -w "%{time_starttransfer}" https://<deploy>.vercel.app/api/user/tier` averaged over 3 runs vs a warm call |

Target: entry JS transfer/parse reduced ≥ 40% (code splitting) and/or ≥ ~950 KB from the logo + repeat-visit revalidation eliminated (P0); Lighthouse mobile LCP improves measurably.
