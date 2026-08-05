# Tasks — CI Workflow Fix (vitest stability + backend lockfile cache)

> The vitest exit-1 failure was observed in CI but did NOT reproduce on the current tree (Node 22.23.x / vitest 4.1.10 → exit 0). Execute §1 (gate) first; the rest is defensive hardening + the verified backend-lockfile fix.

## 0. Baseline + reproduction gate
- [x] `node --version`; `npx vitest run; echo "EXIT=$?"` → record the exit code on the CI Node line. Current baseline expectation: `# tests 1456 | 1456 passed`, exit 0.
- [x] If exit ≠ 0, capture stderr after the summary and confirm it is `Unhandled Rejection: ReferenceError: AudioContext is not defined` before proceeding.

## 1. Root-cause fix: Web Audio guard
- [x] `src/lib/universalAudio.ts`: add `typeof AudioContext !== "undefined"` to the Web-Audio availability check used by `initialize()` (line ~127); `new AudioContext()` is only constructed when the API exists.
- [x] `src/lib/universalAudio.ts`: `ensureContext()` (line ~278) returns early (no throw) when Web Audio is unavailable; no repeated exceptions.
- [x] Verify no behavior change on real web/desktop: `Platform.OS === "web" && typeof window !== "undefined" && typeof AudioContext !== "undefined"` is still true in browsers.

## 2. Defense-in-depth: MasteringSuite
- [x] `src/components/MasteringSuite.tsx` (line ~133): wrap `audioSystem.ensureContext()` in `try/catch`; on error, fall back to a safe state and never reject the effect unhandled.

## 3. Reporter diagnostics
- [x] `tests/ok-reporter.ts`: add `onUnhandledError(err)` and `onUnhandledRejection(err)` hooks that `console.error` message + stack.
- [x] Confirm the reporter still prints the existing `# tests … | … passed` summary format unchanged.

## 4. Backend lockfile / cache
- [x] Remove `backend/package-lock.json` from `.gitignore` (line 11).
- [x] `git add backend/package-lock.json` and include it in the implementation commit (now a tracked file).
- [x] `.github/workflows/ci.yml`: confirm `cache-dependency-path: backend/package-lock.json` resolves after the file is committed (no workflow change expected).

## 5. Version alignment (documentation only)
- [x] Add `"engines": { "node": ">=22" }` to root `package.json` — added in `0a762c2` (shared-prep), not the ci-workflow-fix commit.
- [x] `.nvmrc` with `22` — created in `0a762c2` (shared-prep), not the ci-workflow-fix commit.
- [x] Both CI jobs pin `node-version: 22` in `.github/workflows/ci.yml` (verify both jobs have this pin).

## 6. Verification
- [x] `npx vitest run; echo "EXIT=$?"` exits **0** on Node 22; output contains no "Unhandled Rejection" lines; baseline from §0 recorded in the PR description.
- [x] Manual negative check (revert after): injecting a stray rejection in one test prints the error via the new reporter hooks, proving future failures are visible.
- [x] `npx tsc --noEmit` clean.
- [x] `cd backend && npx tsc --noEmit` clean (lockfile commit only — no backend source change).
- [x] CI green: push to a PR branch; confirm (a) vitest step exit 0, (b) backend `setup-node` cache step has no "Some specified paths were not resolved" warning, (c) `npm ci` succeeds in `backend/`.

## 7. Commits
- [x] **Commit (spec only):** `openspec/changes/ci-workflow-fix/*`. Message: `docs: spec CI workflow fix (vitest stability + backend lockfile)`.
- [x] **Commit (implementation):** all source + config + reporter updates. Message: `fix: CI green — guard AudioContext for jsdom, report unhandled rejections, commit backend lockfile`.
- [x] Push to `master`; confirm both jobs pass.
