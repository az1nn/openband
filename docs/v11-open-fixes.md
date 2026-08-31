# V11 Open Fixes — Resolved Ledger

All outstanding V11 Creative Loop items documented here are fixed and verified, and are
included in the follow-up commit to PR #37 (branch `agent/v11-creative-identity`). Status
of the full verification matrix at time of close: frontend `tsc --noEmit` 0 errors, backend
`tsc --noEmit` 0 errors, vitest **1817 passed**, legacy node:test **24 passed**, `graph:ci`
exit 0 (creativePersistence no longer orphaned), `npm run build` exit 0.

---

## Resolved items

### 1. Production preview audio source is missing (empty-uri no-op) — FIXED
- **In:** `src/components/NewProject.tsx`.
- **Fix:** `handlePreviewPlay` now resolves the selected creative variation from
  `sessionRef.getHistory()` and renders its `result.tracks` to a real blob URL via
  `renderTracksToUrl(tracks, bpm, mood)` from `src/lib/midiSynth.ts`, then calls
  `preview.play({ uri, musicalHash, result })`. Removed the old `uri: ""` no-op path.
- Preview remains disabled (via `cacheKey === null`) until a variation has been generated.

### 2. Long-session / remount / restart stress suites — FIXED
- **In:** `tests/creativeLoopStress.test.ts` (new).
- **Fix:** three suites added:
  - Long-session stress — 120 generations with unique ids + history capacity capping.
  - Remount idempotency — deterministic `musicalContentHash` across sessions + promotion
    dedupe on replay (restart-safe, persist runs once).
  - Restart-like idempotency + preview ownership release — alternating play/end returns
    ownership to `stopped`, concurrent play rejected as `busy`, `previewCacheKeyFor` name-stable.

### 3. Session approve/promote orchestration not driven in the UI — FIXED
- **In:** `src/components/NewProject.tsx`.
- **Fix:** `handleCreate` now routes through the creative session when a variation is
  selected: `buildApprovedSnapshot(variation.result)` → `session.promote(snapshot, { persist })`
  → on success `onCreate(variation.result)` + reset. Falls back to the legacy `gateRef` path
  when no creative variation was selected. `handleScratch` unchanged.

### 4. `applyLocks` "drop" policy shifts role/track index mapping — FIXED
- **In:** `src/lib/lockPolicy.ts`.
- **Fix:** removed `"drop"` from `CardinalityPolicy` (now `"strict" | "preserve"`) and the
  `if (policy === "drop") return;` branch. With no replacement, preserve semantics keep the
  track, so role→track index mapping never shifts (no latent corruption). Updated the
  corresponding test in `tests/creativeSession.test.ts` to assert preserve keeps track count.

### 5. `creativePersistence` orphaned (no inbound src/ import) — FIXED
- **In:** `src/lib/creativePersistence.ts` + `src/components/NewProject.tsx`.
- **Fix:** added `persistCreativeDecision(projectId, recipe, previewUri, result)` which
  builds a minimal valid `ProjectData` (tracks, musicalContentHash, recipe fields, empty
  defaults) and persists via `saveProject(projectId, redactSecrets(data))`. `NewProject`
  now imports and consumes it as the `session.promote` persist callback. `graph:ci`
  no longer flags `creativePersistence` as orphaned.

### 6. Web autoplay still depends on the global pointerdown initializer — FIXED
- **In:** `src/hooks/usePreviewPlayer.ts`.
- **Fix:** after `audioSystem.ensureContext()` on web, the hook now checks the returned
  context; if it is `null` (context unavailable), it sets `status = "failed"` instead of
  blindly calling `player.play()`. Play is triggered from a user gesture (Pressable), so
  autoplay policy is satisfied.

### 7. Natural-end detection relies solely on status transitions — FIXED
- **In:** `src/hooks/usePreviewPlayer.ts`.
- **Fix:** added an explicit `didJustFinish` rising-edge handler that ends playback when the
  player reports natural completion, in addition to the existing `isLoaded && !playing`
  transition — reliable across web and native.

---

## Glass-is-full (already resolved in PR #37 prior to this ledger)
- `projectStarter ↔ creativeIdentity` module cycle (OB-GRAPH-002) — broken via structural
  `MusicalContentSource`.
- Preview busy-rejection + natural-end ownership (unit-only, `previewLifecycle`).
- Telemetry/persist secret redaction incl. `apiKey`.
- Seed fallback (`"" || seed || newSeed()`) fix.
- `CARDINALITY_POLICY` used as default; `detectCardinalityMismatch` includes `unknown`.
