# Tasks: Defer Heavy Root-Entry Dependencies

## Spec
- [x] `openspec/changes/app-entry-defer-deps/proposal.md` — context, objectives, risks
- [x] `openspec/changes/app-entry-defer-deps/design.md` — A (i18n) + B (supabase) details
- [x] `openspec/changes/app-entry-defer-deps/tasks.md` — this checklist

## Implement — i18next lazy init (A)
- [ ] `app/_layout.tsx`: remove `import "../src/lib/i18n";` (line 3)
- [ ] `app/_layout.tsx`: add `useEffect(() => { import("../src/lib/i18n"); }, [])` in `RootLayout`
- [ ] Confirm `src/lib/i18n.ts` unchanged and still self-initializes via module-load `initI18n()`

## Implement — supabase lazy factory (B)
- [ ] `src/lib/supabase.ts`: replace static `createClient` import with `import type` for types
- [ ] `src/lib/supabase.ts`: add cached async `getSupabase()` factory using dynamic
      `import("@supabase/supabase-js")`; preserve mock fallback + options
- [ ] `src/lib/supabase.ts`: remove `export const supabase` (now replaced by `getSupabase`)
- [ ] `src/context/AuthContext.tsx`: `import type { Session, User }`; refactor mount effect to
      `await getSupabase()`, capture `onAuthStateChange` subscription for cleanup
- [ ] `src/lib/feedApi.ts`: `const supabase = await getSupabase();`
- [ ] `src/lib/cloudSync.ts`: `await getSupabase()` in each affected async function
- [ ] `src/components/GenerateCoverModal.tsx`: `await getSupabase()`
- [ ] `src/lib/objectStorage.ts`: `await getSupabase()`
- [ ] Grep to confirm no remaining synchronous `supabase.` / `import { supabase }` usages

## Verify
- [ ] `npx tsc --noEmit` (frontend) — zero errors
- [ ] `cd backend && npx tsc --noEmit` — zero errors
- [ ] `npx vitest run` — all pass
- [ ] `npm run test:legacy` — all pass
- [ ] `code-review` subagent — no synchronous supabase usage, no dead imports, no regressions
- [ ] Confirm offline (no env vars) still resolves `getSupabase()` to mock without network

## Archive & commit
- [ ] Move `openspec/changes/app-entry-defer-deps` → `openspec/archive/app-entry-defer-deps`
- [ ] Commit spec (separate from implementation per SDD)
- [ ] Commit implementation + tests
- [ ] Report; note push remains blocked by SSH (Permission denied publickey)
