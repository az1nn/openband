# Design: Defer Heavy Root-Entry Dependencies

## A. i18next — lazy init (low risk)

**`app/_layout.tsx`**
- Remove the side-effect import at line 3: `import "../src/lib/i18n";`
- In `RootLayout`, add an effect that triggers the existing async init:
  ```tsx
  useEffect(() => {
    import("../src/lib/i18n");
  }, []);
  ```
- `src/lib/i18n.ts` is unchanged: its module-load `initI18n()` side effect runs the first
  time the chunk is imported (on mount). `react-i18next`'s `useTranslation` already
  tolerates pre-init state. No other file imports `i18n` from the entry, so nothing else
  changes.

**Why safe:** `initI18n()` is already async and fire-and-forget; the only entry-side
consumer was the removed side-effect import. Mastering-route screens that use
`react-i18next` directly are already code-split and keep working.

## B. `@supabase/supabase-js` — lazy async factory (moderate risk)

**`src/lib/supabase.ts`**
- Remove the static runtime import: `import { createClient } from "@supabase/supabase-js";`
  Keep type-only usage: `import type { SupabaseClient, Session } from "@supabase/supabase-js";`
  (also update `src/context/AuthContext.tsx:9` to `import type { Session, User }`).
- Replace `export const supabase = createClient(...)` with a cached async factory:
  ```ts
  let clientPromise: Promise<SupabaseClient | ReturnType<typeof createMockClient>> | null = null;

  export async function getSupabase(): Promise<SupabaseClient | ReturnType<typeof createMockClient>> {
    if (!clientPromise) {
      clientPromise = (async () => {
        if (supabaseUrl && supabaseAnonKey) {
          const { createClient } = await import("@supabase/supabase-js");
          return createClient(supabaseUrl, supabaseAnonKey, { ... });
        }
        return createMockClient();
      })();
    }
    return clientPromise;
  }
  ```
- Preserve all existing mock fallback behavior, `EXPO_PUBLIC_*` env reads, and options
  (e.g. `auth: { persistSession, autoRefreshToken }`, `realtime: false`). Keep helper
  exports that don't depend on the client (e.g. `getSupabaseConfig()`) if present.

**Consumers to update (all already async):**

| File | Change |
|------|--------|
| `src/context/AuthContext.tsx` | In the mount effect, `const sb = await getSupabase();` then use `sb.auth.*`. Capture the `onAuthStateChange` subscription after the await; `unsubscribe` in cleanup (use an `active`/`cancelled` flag + local `subscription` var). Change `import { Session, User }` → `import type`. |
| `src/lib/feedApi.ts:21` | `const supabase = await getSupabase();` before `await supabase.auth.getSession()`. |
| `src/lib/cloudSync.ts` (lines 29, 218, 223, 245, 250) | `const supabase = await getSupabase();` at the top of each affected async function. |
| `src/components/GenerateCoverModal.tsx:79` | `const supabase = await getSupabase();` before `await supabase.auth.getSession()`. |
| `src/lib/objectStorage.ts:80` | `const supabase = await getSupabase();` before `await supabase.auth.getSession()`. |

Each consumer currently does `supabase.auth.getSession()` etc. — only the *source* of the
`supabase` reference changes (now awaited). No logic inside the methods changes.

## Bundle impact
- `@supabase/supabase-js` and `i18next` (+locales) move out of the entry chunk into
  lazily-fetched chunks loaded after first paint. The initial JS payload shrinks
  significantly, improving Time-to-Interactive on cold load.

## Verification
- `npx tsc --noEmit` (frontend + backend) — zero errors.
- `npx vitest run` — all pass (esp. any auth/supabase/cloudSync/feed tests).
- `npm run test:legacy` — all pass.
- Offline behavior: with no env vars, `getSupabase()` resolves to the mock client (no
  network, no crash) — same as before.
- Code-review subagent: confirm no synchronous `supabase` usage remains, no dead imports.

## Out of scope (carried-forward)
- Deep code-splitting of the root `_layout` itself (Supabase auth still mounts eagerly by
  design; only its heavy dependency is now deferred).
- Replacing `@supabase/supabase-js` with a lighter client.
