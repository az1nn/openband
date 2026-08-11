# Tasks — i18n Completeness (deferred follow-up)

Canonical spec: `openspec/specs/i18n/spec.md`. All items below are the OPEN/DEFERRED remainder of the i18n batch. Shipped work (pt-BR default locale, `useT` hook, expanded `settings`/`feed`/`library`/`account`/`newProject`/`moments`/`extractor` dictionaries, and migrated `app/tabs/{settings,index,library,account,moments}.tsx`, `app/extractor.tsx`, `src/components/NewProject.tsx`) is captured in the spec and is out of scope here.

## 1. Studio namespace (deferred) — DONE
- [x] Add `studio` namespace to `src/locales/{en,pt,es}.json` (from `app/studio/[id].tsx`): permission alert, record/generate/MIDI-import errors, command-palette labels (`Play`, `Record`, `Undo`, `Redo`, `Delete`, `Add Track`, …), track menu, "Salvo ✓" toast, compare/mix labels.
- [x] Migrate `app/studio/[id].tsx` to `t("studio.*", "English fallback")` — also migrated `app/studio/hooks.ts`, `app/studio/parts.tsx`, `app/studio/StudioModals.tsx`; a11y labels + tools menu (`toolBranches`, `toolCommit`, `toolSampler`, `toolSynth`, `toolPatchbay`, `toolMidi`, `toolLooper`, `toolCodeSampler`, `toolPromptSampler`, `toolSamples`) migrated.

## 2. Mastering namespace (deferred) — DONE
- [x] Add `mastering` namespace to `src/locales/{en,pt,es}.json` (from `app/mastering/index.tsx`): chain labels, export strings, LUFS labels.
- [x] Migrate `app/mastering/index.tsx` + `src/components/{MasteringSuite,MasteringChain,MasteringVersionManager,MasteringUpload,LufsMeter}.tsx` to `t("mastering.*", ...)`; added `errorTitle`, `mp3Cbr`, `on/off`, `bypass/ab`, `inputLabel`, `singleFile`, `stemsLabel`, `multiTrackHint`, `uploadMix/Stems`, `uploadRangeHint`, `uploadStemsHint`, `metricIntegrated/ShortTerm/TruePeak/Lra`, `unitLufs/Dbtp/Lu`.

## 3. Explorer namespace + screen (deferred) — DONE
- [x] Add `explorer` namespace to `src/locales/{en,pt,es}.json` (from `app/explorer.tsx`): browse strings.
- [x] Migrate `app/explorer.tsx` to `t("explorer.*", ...)`; embedded `MISSION_HTML` now takes the translated title instead of a hardcoded `MISSÃO`.

## 4. Mixer namespace (deferred) — DONE
- [x] Add `mixer` namespace to `src/locales/{en,pt,es}.json` (from `app/mixing-console.tsx`): transport glyphs are unicode (keep), migrate any text labels.
- [x] Migrate `app/mixing-console.tsx` text labels to `t("mixer.*", ...)`.

## 5. Secondary screen (deferred) — DONE
- [x] `app/tabs/feed.tsx` — re-exports `app/tabs/index.tsx` (already migrated); no separate migration needed.

## 6. Coverage test (new) — DONE
- [x] Create `tests/i18n-coverage.test.ts`:
  - Asserts `en.json`, `pt.json`, `es.json` have identical nested key sets (deep key parity).
  - Counts extracted keys per namespace and asserts growth vs. the ~14-key baseline.
  - Greps the migrated batch for leftover user-visible hardcoded string literals and fails if any remain outside `t(...)`.

## 7. Verification (remaining) — DONE
- [x] `npx tsc --noEmit` clean
- [x] `cd backend && npx tsc --noEmit` clean
- [x] `npx vitest run` passes (1479/1479), including the new coverage test
- [x] `npm run test:legacy` passes (24/24)
- [x] `npm run build` succeeds
- [ ] Manual: Settings language toggle flips pt-BR / en / es across ALL migrated screens (including newly migrated studio/mastering/explorer/mixer) with no hardcoded leakage.
