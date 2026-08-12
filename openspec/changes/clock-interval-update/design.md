# Design: clockManager interval update while running

## Current flow
1. `startClock(intervalMs)` — guard `isRunning || !web` → early return.
2. Terminate any `workerInstance`.
3. `getAudioContext()` — if null, return.
4. Create blob → URL → new `Worker`.
5. Attach `onmessage` / `onerror` handlers.
6. `postMessage({ type: "start", interval })`.
7. `isRunning = true`.

## Proposed change
- **Remove** `isRunning` from the early-return guard on line 40 so the
  function proceeds; keep the `Platform.OS !== "web"` guard.
- When the clock is already running, the existing termination block
  (lines 42-45) already cleanly disposes the old worker:
  ```ts
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
  ```
  Terminating is sufficient — no `setInterval` message protocol change is
  needed; the new worker receives the new `interval` via `postMessage`.
- The `onmessage` handler is re-attached to the new worker (line 56), so
  listener notifications continue to fire.
- `listeners` (module-level `Set`) is preserved across restarts — tick
  callbacks remain registered.
- `isRunning` stays `true` (set at line 74); no state flip needed.
- Default argument `25` is unchanged; `getAudioContext()` early-return
  preserves the non-web / no-context behaviour for the first call.

## Resulting public API (unchanged surface)
```ts
startClock(intervalMs?: number): void
```
- First call while stopped: starts worker at `intervalMs` (default 25).
- Call while running: terminates old worker, starts new one at
  `intervalMs`. No duplicate workers.
- Non-web / no AudioContext: no-op (as before).

## No new dependencies / no signature changes
