# Design — CI Workflow Fix (vitest stability + backend lockfile cache)

## File / Requirement Mapping

| Change | File | Symbols / lines |
|---|---|---|
| Guard AudioContext | `src/lib/universalAudio.ts` | `initialize()` at line ~127: guard `new AudioContext()` with `typeof AudioContext !== "undefined"` (in addition to the existing `Platform.OS === "web" && typeof window !== "undefined"` check) — **implemented**: `webAudioAvailable()` now includes the `typeof AudioContext !== "undefined"` guard |
| Harden bootstrapping | `src/components/MasteringSuite.tsx` | `useEffect` at line ~133: wrap `audioSystem.ensureContext()` in `try/catch` so a missing Web Audio API degrades gracefully instead of rejecting unhandled |
| Reporter diagnostics | `tests/ok-reporter.ts` | add `onUnhandledError(err)` and `onUnhandledRejection(err)` hooks that `console.error` the message + stack (vitest reporter API) |
| Lockfile committed | `.gitignore` | delete line 11 (`backend/package-lock.json`) so it is tracked and cached by CI |
| CI version alignment | `package.json` | add `"engines": { "node": ">=22" }` (added in `0a762c2` shared-prep); `.nvmrc` was NOT created as part of this change (only `engines` was added) |
| Workflow (optional cleanup) | `.github/workflows/ci.yml` | keep `node-version: 22`; confirm `cache-dependency-path: backend/package-lock.json` now resolves post-commit |

## 1. Reproduction gate (do FIRST)

Record the current behavior on the CI Node line before changing anything:

```
node --version
npx vitest run; echo "EXIT=$?"
```

- If exit is already 0 (`# tests 1456 | 1456 passed` on Node 22.23.x): the exit-1 from CI was environment/version-dependent (older commit, 1438 tests). Proceed with the hardening below anyway — it removes the root cause of the stray rejection and makes any future occurrence visible. Document the baseline in the PR.
- If exit is non-zero: capture the stderr after the summary; if it is an `Unhandled Rejection: ReferenceError: AudioContext is not defined`, it confirms the mechanism. Apply the fixes below and re-run to exit 0.

## 2. Root-cause fix: `src/lib/universalAudio.ts`

The constructor currently runs whenever `Platform.OS === "web"` and `window` exists. In jsdom both are true but `AudioContext` is undefined. The availability check was updated so `initialize()` **no-ops in environments without Web Audio**:

```
webAudioAvailable()
  → Platform.OS === "web" && typeof window !== "undefined" && typeof AudioContext !== "undefined"
```

- `initialize()` (line ~127): gate `this._audioCtx = new AudioContext()` behind the new check; set a `webAudioUnavailable` flag so later calls are no-ops rather than repeated throws.
- `ensureContext()` (line ~278): after calling `initialize()`, return early if the flag is set.
- Keep all existing behavior unchanged on real browsers/desktop (the guard is false only when `AudioContext` is missing — jsdom/test env).
- **Related risk (documented, not in scope):** jsdom also lacks `OfflineAudioContext`, used in ~19 places across `src/` (e.g. `previewEngine.ts:229`, `midiSynth.ts`, `mastering.ts`, `timeStretch.ts`). This change fixes the concrete test-path leak only; future tests touching those paths may need the same `typeof OfflineAudioContext` guard.

## 3. Harden `src/components/MasteringSuite.tsx`

`useEffect` (line ~133): wrap `audioSystem.ensureContext()` in `try/catch`. On failure, keep the component functional (metering/analytics fall back to zeroed state); never allow a rejected promise to escape the effect. Defense-in-depth — the primary fix is §2, but no UI effect should ever reject unhandled.

## 4. Reporter: `tests/ok-reporter.ts`

Add to the returned reporter object:

```
onUnhandledError(err)          { console.error("\nUnhandled Error:", err?.message || err); }
onUnhandledRejection(err)      { console.error("\nUnhandled Rejection:", err?.message || err, err?.stack || ""); }
```

These make any future stray rejection **visible** in CI output (today it is swallowed and only a silent exit 1 is emitted in the environments where the runtime surfaces it). Diagnostic improvement, not a suppression.

## 5. Backend lockfile

- Delete `.gitignore:11` (`backend/package-lock.json`).
- `git add backend/package-lock.json` and commit it (standard practice for the `backend` npm project; also required for `npm ci`).
- After this, `actions/setup-node@v4` with `cache: npm` + `cache-dependency-path: backend/package-lock.json` resolves and caches, and `npm ci` in `backend/` works on a fresh checkout.

## 6. Version alignment

- Add `"engines": { "node": ">=22" }` to root `package.json` (documented minimum) — **done** (added in `0a762c2` shared-prep). A root `.nvmrc` with `22` was **NOT** created as part of this change (only `engines` was added); local dev and CI still share Node 22 via the workflow pin.
- Note: `backend/package-lock.json` is now **committed** (removed from `.gitignore` line 11), enabling `setup-node` npm caching and `npm ci` on fresh checkouts.
- The "Node 20 is being deprecated" notice is informational (runner-internal actions); because the workflow pins `node-version: 22`, no action is required. Bumping to 24 later is out of scope.

## 7. Acceptance criteria

- `npx vitest run; echo $?` exits **0** on Node 22 with `# tests 1456 | 1456 passed` and **no** "Unhandled Rejection" in the output (baseline recorded per §1) — matches verified local result.
- Manual negative check (reverted after): injecting a stray rejection in a test prints the error via the new reporter hooks — proving future failures are visible.
- CI `backend` job: `setup-node` cache step no longer warns "Some specified paths were not resolved"; `npm ci` succeeds.
- `npx tsc --noEmit` clean after the `universalAudio.ts`/`MasteringSuite.tsx` edits.
- Both CI jobs green on a push to a PR branch.
