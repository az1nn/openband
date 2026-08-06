# Tasks — i18n Completeness (deferred follow-up)

Canonical spec: `openspec/specs/i18n/spec.md`. All items below are the OPEN/DEFERRED remainder of the i18n batch. Shipped work (pt-BR default locale, `useT` hook, expanded `settings`/`feed`/`library`/`account`/`newProject`/`moments`/`extractor` dictionaries, and migrated `app/tabs/{settings,index,library,account,moments}.tsx`, `app/extractor.tsx`, `src/components/NewProject.tsx`) is captured in the spec and is out of scope here.

## 1. Studio namespace (deferred)
- [ ] Add `studio` namespace to `src/locales/{en,pt,es}.json` (from `app/studio/[id].tsx`): permission alert, record/generate/MIDI-import errors, command-palette labels (`Play`, `Record`, `Undo`, `Redo`, `Delete`, `Add Track`, …), track menu, "Salvo ✓" toast, compare/mix labels.
- [ ] Migrate `app/studio/[id].tsx` to `t("studio.*", "English fallback")` — currently hardcodes pt strings (e.g. `app/studio/[id].tsx:329`).

## 2. Mastering namespace (deferred)
- [ ] Add `mastering` namespace to `src/locales/{en,pt,es}.json` (from `app/mastering/index.tsx`): chain labels, export strings, LUFS labels.
- [ ] Migrate `app/mastering/index.tsx` to `t("mastering.*", ...)`.

## 3. Explorer namespace + screen (deferred)
- [ ] Add `explorer` namespace to `src/locales/{en,pt,es}.json` (from `app/tabs/explorer.tsx`): browse strings.
- [ ] Migrate `app/tabs/explorer.tsx` to `t("explorer.*", ...)` — currently has no `useTranslation` usage.

## 4. Mixer namespace (deferred)
- [ ] Add `mixer` namespace to `src/locales/{en,pt,es}.json` (from `app/mixing-console.tsx`): transport glyphs are unicode (keep), migrate any text labels.
- [ ] Migrate `app/mixing-console.tsx` text labels to `t("mixer.*", ...)`.

## 5. Secondary screen (deferred)
- [ ] `app/tabs/feed.tsx` — separate feed screen not yet migrated (feed namespace already covers `app/tabs/index.tsx`).

## 6. Coverage test (new)
- [ ] Create `tests/i18n-coverage.test.ts`:
  - Asserts `en.json`, `pt.json`, `es.json` have identical nested key sets (deep key parity).
  - Counts extracted keys per namespace and asserts growth vs. the ~14-key baseline.
  - Greps the migrated batch (`app/tabs/*`, `src/components/NewProject.tsx`, `app/extractor.tsx`) for leftover user-visible hardcoded string literals and fails if any remain outside `t(...)`.

## 7. Verification (remaining)
- [ ] `npx tsc --noEmit` clean
- [ ] `cd backend && npx tsc --noEmit` clean (no backend i18n changes, sanity only)
- [ ] `npx vitest run` passes, including the new coverage test
- [ ] `npm run test:legacy` passes
- [ ] `npm run build` succeeds
- [ ] Manual: Settings language toggle flips pt-BR / en / es across ALL migrated screens (including newly migrated studio/mastering/explorer/mixer) with no hardcoded leakage.
