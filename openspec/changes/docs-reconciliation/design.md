# Design: Docs & Specs Full Reconciliation

## Workflow

Every change follows the OpenSpec SDD loop. This change is documentation-only.

### Step 1 — Archive 16 completed changes + 2 empty stubs

Move these folders from `openspec/changes/` to `openspec/archive/`:

| Change folder | Status | Canonical spec |
|---|---|---|
| `accessibility-pass` | implemented | `accessibility` |
| `ai-cover-generation` | implemented | none (docs-only spec) |
| `build-social-feed-backend` | implemented | `social-feed` |
| `comprehensive-test-suite` | implemented | none |
| `mastering-chain-validation` | implemented | `mastering-plugins` |
| `mastering-preset-fixes` | empty stub | `mastering-plugins` |
| `mixer-console-vu-groups` | implemented | `mixer-console` |
| `mixer-functions` | implemented | `mixer-console` |
| `polish-core-specs` | implemented | `audio-plugins`, `mastering-plugins`, `project-starter` |
| `project-starter-fixes` | empty stub | `project-starter` |
| `project-starter-wiring` | implemented | `project-starter` |
| `recorded-url-persistence` | implemented | `audio-system.md` |
| `ship-wasm-binary` | implemented | `wasm-plugins` |
| `studio-add-clip` | implemented | `studio-daw` |
| `surface-auth-tier-ui` | implemented | `auth` |
| `voice-cleaner-metrics` | implemented | `ai-voice-cleaner` |
| `web-player-studio-audio` | implemented | `audio-system.md`/`studio-daw` |
| `wire-modulation-matrix` | implemented | `modulation-matrix` |

Archival steps per folder:
1. Verify the canonical spec already covers the change's requirements; if not, add a
   short requirement/note to the spec (updating line refs only where trivial).
2. `git mv` the folder to `openspec/archive/<name>`.
3. For empty stubs, archive with a one-line `proposal.md` marking it superseded/stale.

### Step 2 — Partial changes: archive done portions, keep open work

| Change folder | Done portions → promote to spec | Open work kept in `changes/` |
|---|---|---|
| `document-plugin-specs` | `audio-plugins`, `mastering-plugins` already exist; `immersive-studio` spec missing → add spec + update tasks | plugin test-gap tracking |
| `i18n-completeness` | i18n infra + en/pt/es expansion → new `openspec/specs/i18n/spec.md` | studio/extractor/mastering/explorer namespaces, `tests/i18n-coverage.test.ts` |
| `native-builds` | android/ + electron/ + BUILD.md + bridge tests → new `openspec/specs/native-builds/spec.md` | assembleRelease/electron run, device-path recording |
| `roadmap-v3` | M1 cloud-sync, M2 recording, M5 i18n → mark in relevant specs; MIDI partial → note | M3 MIDI (SoundFont/drag-resize), M4 bundle |
| `vercel-performance` | P0+P1 (headers, logo, preload, defer) → new `openspec/specs/vercel-performance/spec.md` | P2 code-split/SW-precache/dead-deps |
| `web-playback-fix` | resumeForGesture/preloadPreview/playheadStore → `audio-transport.md` | `renderWorker.ts` migration (replaced by main-thread cache — mark superseded) |

Each partial folder keeps `tasks.md` with only un-done items; done items get a pointer to
the canonical spec or archive.

### Step 3 — Reconcile status docs

- `docs/pending-implementations.md` is source of truth. Update header date to today and
  add sections/checkmarks for the newest completed changes: `ai-cover-generation`,
  `vercel-performance` (P0+P1), `mixer-functions`, `comprehensive-test-suite`,
  `native-builds` (partial), `mastering-chain-validation`, `project-starter-wiring`,
  `polish-core-specs`, `accessibility-pass`, `surface-auth-tier-ui`, `wire-modulation-matrix`.
- `docs/unimplemented-specs.md` must be regenerated to list ONLY genuinely unimplemented
  items (the open work from Step 2), with owning change + priority, and must not contradict
  `pending-implementations.md`.

### Step 4 — Update roadmap

`docs/roadmap.md`: bump "Last updated" to today, add the newly shipped features to the
Shipped list, move anything that is now shipped out of future phases, and update the
"NOT to work on" list if stale.

### Step 5 — Update AGENTS.md

- SDK 56 → 57, RN 0.86, vitest 4, TypeScript 6 references.
- Refresh test counts from actual run (see Verification).
- Refresh component count / stories count from actual files.
- Keep `expo-audio` (still correct for SDK 57).

### Step 6 — Verify

```
npx tsc --noEmit
cd backend && npx tsc --noEmit
npx vitest run
npm run test:legacy
npm run build
```

Update any test-count claims that were wrong. No source behavior changes are expected, so
build/test should already pass; fix only count-vs-reality mismatches.

## File change map

| File | Action |
|---|---|
| `openspec/changes/<16 implemented + 2 stubs>` | `git mv` → `openspec/archive/` |
| `openspec/changes/<6 partial>` | edit `tasks.md`, keep in place |
| `openspec/specs/*` (targets in table) | append/refresh requirements + line refs |
| `docs/pending-implementations.md` | refresh date + add recent completions |
| `docs/unimplemented-specs.md` | regenerate against open work only |
| `docs/roadmap.md` | refresh shipped list + date |
| `AGENTS.md` | SDK 57, counts, commands |
| `docs/*` others | update only where clearly stale (features-implementation.md counts) |
