# Tasks: Docs & Specs Full Reconciliation

## 1. Baseline verification
- [ ] Run `npx vitest run` and `npm run test:legacy`; record total test counts.
- [ ] Count components in `src/components/index.ts` and stories in `stories/`.
- [ ] Confirm working tree clean before archiving.

## 2. Archive completed changes
- [ ] `git mv` each of these 16 folders from `openspec/changes/` → `openspec/archive/`:
  accessibility-pass, ai-cover-generation, build-social-feed-backend,
  comprehensive-test-suite, mastering-chain-validation, mixer-console-vu-groups,
  mixer-functions, polish-core-specs, project-starter-wiring, recorded-url-persistence,
  ship-wasm-binary, studio-add-clip, surface-auth-tier-ui, voice-cleaner-metrics,
  web-player-studio-audio, wire-modulation-matrix.
- [ ] Archive empty stubs `mastering-preset-fixes` and `project-starter-fixes` with a
  one-line proposal marking them stale/superseded.
- [ ] Update canonical specs where archived work is not yet reflected (verify each spec
  already covers the change; add a note only where missing). Verify with `git diff`.

## 3. Partial changes — split done vs open
- [ ] `document-plugin-specs`: ensure `audio-plugins`/`mastering-plugins` specs exist;
  create `openspec/specs/immersive-studio/spec.md` if missing; trim `tasks.md` to open
  plugin test-gap items.
- [ ] `i18n-completeness`: create `openspec/specs/i18n/spec.md` covering useT +
  en/pt/es namespaces; trim `tasks.md` to deferred namespaces + coverage test.
- [ ] `native-builds`: create `openspec/specs/native-builds/spec.md` covering android/,
  electron/, BUILD.md, bridge tests; trim `tasks.md` to un-run builds + device-path
  recording.
- [ ] `roadmap-v3`: mark done milestones (M1 cloud-sync, M2 recording, M5 i18n) in
  relevant specs; trim `tasks.md` to M3 MIDI remaining + M4 bundle.
- [ ] `vercel-performance`: create `openspec/specs/vercel-performance/spec.md` for P0+P1;
  trim `tasks.md` to P2.
- [ ] `web-playback-fix`: fold done portions into `audio-transport.md`; mark
  `renderWorker.ts` as superseded; trim `tasks.md`.

## 4. Status docs
- [ ] Update `docs/pending-implementations.md` header date; add checkmarks for
  ai-cover-generation, vercel-performance P0+P1, mixer-functions, comprehensive-test-suite,
  native-builds (partial), mastering-chain-validation, project-starter-wiring,
  polish-core-specs, accessibility-pass, surface-auth-tier-ui, wire-modulation-matrix.
- [ ] Regenerate `docs/unimplemented-specs.md` to list only genuinely open items (from
  Step 3), consistent with `pending-implementations.md`.

## 5. Roadmap
- [ ] Update `docs/roadmap.md`: fresh date, add shipped features, remove shipped items
  from future phases, refresh NOT-to-work-on list.

## 6. AGENTS.md
- [ ] Update SDK/RN/vitest/TS references to SDK 57 / RN 0.86 / vitest 4 / TS 6.
- [ ] Refresh test counts, component count, stories count.
- [ ] Refresh any stale commands/architecture references.

## 7. Other docs
- [ ] Update `docs/features-implementation.md` / `docs/testing-mocks.md` only where
  clearly stale (counts, file names). Do not rewrite.

## 8. Verification
- [ ] `npx tsc --noEmit` passes.
- [ ] `cd backend && npx tsc --noEmit` passes.
- [ ] `npx vitest run` passes.
- [ ] `npm run test:legacy` passes.
- [ ] `npm run build` succeeds.
- [ ] `git status` shows only expected doc/spec changes.

## 9. Commit & push
- [ ] Spec commit: commit the `openspec/changes/docs-reconciliation/` spec files first,
  push.
- [ ] Implementation commit: all doc/spec/archive changes, push.
