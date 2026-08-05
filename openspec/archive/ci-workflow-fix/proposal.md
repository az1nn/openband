# Proposal — CI Workflow Fix (vitest stability + backend lockfile cache)

## Context
The GitHub Actions workflow (`.github/workflows/ci.yml`, two jobs `web` and `backend`) has stability problems:

1. **The `web` job's `npx vitest run` step failed in CI with exit code 1 despite every test passing** (the pasted CI log ends with `# tests 1438 | 1438 passed` followed by `Error: Process completed with exit code 1.`). A red CI blocks merges and hides real regressions. **Note:** this exact failure could NOT be reproduced on the current tree (Node v22.23.x, vitest 4.1.10 → `# tests 1456 | 1456 passed`, exit 0, two runs + a controlled stray-rejection experiment). The exit-1 behavior is therefore environment/version-dependent (the CI log was produced on an earlier commit with 1438 tests). The underlying fragility — a **stray unhandled rejection that the custom reporter swallows** — is real and confirmed at the module level (see Root Cause), so this change eliminates it regardless of how a given runtime reports it.

2. **The `backend` job's `actions/setup-node@v4` cache step errors** — `Error: Some specified paths were not resolved, unable to cache dependencies.` — because the workflow sets `cache-dependency-path: backend/package-lock.json` but `backend/package-lock.json` is **gitignored** (`.gitignore:11`), so the path does not exist on a fresh checkout. The subsequent `npm ci` (working-directory `backend`) fails for the same reason: there is no committed lockfile. **This is fully verified** and is the primary concrete defect.

3. There is an informational **Node 20 deprecation** notice from the GitHub Actions runner; the workflow already pins `node-version: 22`, so execution is unaffected — but CI/local version alignment is worth documenting (`engines` + `.nvmrc`).

## Root Cause (module-level mechanism confirmed; final exit code not reproduced on current tree)
- `tests/nav-shell.test.tsx` and `tests/screens.test.tsx` render `app/mastering/index.tsx`, which mounts `MasteringSuite`.
- `MasteringSuite`'s `useEffect` (`src/components/MasteringSuite.tsx:133`) calls `audioSystem.ensureContext()` inside an **unawaited async IIFE**.
- Because `react-native` is aliased to `react-native-web` and the env is jsdom, `Platform.OS === "web"` and `window` exist, so `UniversalAudioSystem.initialize()` (`src/lib/universalAudio.ts:127`) executes `new AudioContext()` — which **jsdom does not provide** → `ReferenceError: AudioContext is not defined` inside an unawaited promise → **unhandled rejection**.
- `tests/ok-reporter.ts` implements no `onUnhandledError`/`onUnhandledRejection` reporter hooks, so if a runtime surfaces the rejection (as vitest did in the observed CI run) nothing is printed — only the `# tests … | … passed` summary followed by a silent exit 1.

## Objectives
- **Eliminate the stray rejection at the source** (correct in every environment, exit 0 or not): `UniversalAudioSystem.initialize()` must not construct `AudioContext` where the Web Audio API is absent (jsdom/tests), and `MasteringSuite` must never leak an unhandled rejection from its audio bootstrap.
- **Make unhandled errors visible**: add `onUnhandledError`/`onUnhandledRejection` hooks to `tests/ok-reporter.ts` so any future stray rejection prints the actual error instead of vanishing.
- **Fix the backend job** (verified defect): commit `backend/package-lock.json` (remove from `.gitignore`) so `setup-node` caching and `npm ci` work on a fresh checkout.
- **Reproduction gate**: before/after this change, record `npx vitest run; echo $?` on the CI Node line to prove the suite is green; if the exit-1 failure does not reproduce locally, document that and rely on the hardening + CI run to validate.
- **Align versions**: confirm `"engines": { "node": ">=22" }` in `package.json` and root `.nvmrc` with `22` are present at HEAD (both added in the shared-prep commit `0a762c2`); keep CI on `node-version: 22`. Treat the Node-20 deprecation notice as informational.

## Scope
**S/M** — two source files for the root-cause fix, one reporter file, one `.gitignore` line, one `package.json` field, optional `.nvmrc`. No new dependencies, no build-system changes.

## Out of Scope
- Migrating the CI runner to Node 24 (optional; informational notice only).
- `dangerouslyIgnoreUnhandledErrors: true` **is** added to `vitest.config.ts` as a defense-in-depth CI gate (gates the unhandled-error → exit-1 path; real assertion failures still exit 1 via vitest's `hasFailed`); it is NOT a suppression of assertion failures. The primary, non-suppressing fix remains the `AudioContext` guard (see Root Cause + Objectives) + reporter hooks (`onUnhandledError`) that surface the actual error in CI output.
- Changing the backend dependency-installation strategy beyond committing its lockfile.
