# Tasks: clockManager interval update while running

## Files
- `src/lib/clockManager.ts`

## Checklist
1. `read src/lib/clockManager.ts` — confirm guard on line 40.
2. Edit line 40: change
   `if (isRunning || Platform.OS !== "web") return;`
   to
   `if (Platform.OS !== "web") return;`
3. Verify no other early-return depends on `isRunning` inside `startClock`.
4. Confirm the existing worker-termination block (lines 42-45) fires on
   re-entry and leaves exactly one `workerInstance`.
5. Confirm default argument `= 25` is preserved on the signature.
6. Run `npx tsc --noEmit` — fix any errors in touched file only.
7. Run `npx vitest run tests/studio-audio-pure.test.ts` — confirm pass.

## Verification expectations
- `startClock(25)` then `startClock(50)` while running should not throw and
  should not create a duplicate worker.
- `isClockRunning()` returns `true` after a mid-run restart.
- Non-web / null AudioContext: no-op (unchanged).

## Tests
- No test asserts the old buggy early-return; no test updates expected.
- (The existing `studio-audio-pure.test.ts` mock returns `null` for
  `getSharedAudioContext`, so `startClock` still returns early after the
  guard — behaviour for that test is unchanged.)
