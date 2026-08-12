# Proposal: Defer Heavy Root-Entry Dependencies

## Context
Initial app load is slow because the root entry `app/_layout.tsx` eagerly bundles two
heavy dependencies into the first-paint chunk:

- **`@supabase/supabase-js` (^2.50.0, ~700KB)** — pulled in transitively by
  `AuthProvider` → `src/context/AuthContext.tsx` → `src/lib/supabase.ts`, where
  `createClient(...)` runs at module-eval time (`export const supabase = ...`).
- **`i18next` + `react-i18next` + 3 locale JSONs** — pulled in by a pure side-effect
  import `import "../src/lib/i18n";` at `app/_layout.tsx:3`.

Both are only needed *after* first paint (auth initializes on mount; translations
render keys until ready). They belong in lazily-loaded chunks, not the entry bundle.

This is **phase 2** of app-performance work. Phase 1 (`app-load-perf`, archived) covered
the Library and Feed tabs. This phase shrinks the root entry chunk itself.

## Problem
- `@supabase/supabase-js` is statically imported and its client is constructed during
  module evaluation, forcing the entire package into the initial bundle even though no
  supabase call happens synchronously on startup.
- `i18next` + locales are imported for their side effect at the top of the root layout,
  adding a large payload to first paint with no functional benefit at that moment.

## Objectives
1. Remove `i18next` from the initial chunk by lazily importing `src/lib/i18n` inside a
   `RootLayout` effect (the existing `initI18n()` is already async/fire-and-forget).
2. Make `@supabase/supabase-js` reachable only via a dynamic `import()` so it splits into
   its own chunk. Replace the static `export const supabase` with an async
   `getSupabase()` factory that lazily builds (and caches) the real or mock client.
3. Update the 5 existing consumers to obtain the client via `await getSupabase()` inside
   their already-async contexts. Keep the mock fallback intact so offline/dev still works.

## Non-Goals
- No change to auth behavior, offline behavior, or translation output.
- No change to the supabase mock logic itself.
- No re-architecting of `AuthContext` beyond the minimal async-getter refactor.

## Risks
- **supabase refactor (moderate):** all 5 call sites must `await getSupabase()` instead of
  using the synchronous `supabase` value. Every current call site already `await`s the
  supabase *methods* inside an async function/effect, so the change is mechanical — only
  `AuthContext`'s `onAuthStateChange` subscription cleanup needs a small async-safe
  pattern (capture subscription after the await, unsubscribe in cleanup).
- **i18n (low):** removing the side-effect import means translations initialize slightly
  later; `react-i18next` tolerates pre-init state (renders keys). The existing auth
  `loading` spinner already covers initial render, so no key-flash for most users.
