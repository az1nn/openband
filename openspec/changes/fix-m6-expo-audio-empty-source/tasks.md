# Tasks — M6: expo-audio Empty-Source Sentinel

- [ ] **T1** In `src/hooks/useUniversalAudio.ts:10`, change `useAudioPlayer(source ?? "")` to `useAudioPlayer(source || null)`.
- [ ] **T2** Add `tests/useUniversalAudio.test.tsx` that `vi.mock("expo-audio")` with a spy capturing the first argument of `useAudioPlayer`.
- [ ] **T3** In the test, render the hook (`renderHook`) with `source` = `null`, `undefined`, `""`, and a real URL; assert `useAudioPlayer` received `null`/`null`/`null`/URL respectively (never `""`).
- [ ] **T4** In the test, call `result.current.play()` with an empty source; assert it resolves/rejects without throwing and `isLoaded` is false.
- [ ] **T5** Run `npx tsc --noEmit` (frontend) — zero errors.
- [ ] **T6** Run `npx vitest run tests/useUniversalAudio.test.tsx` — all pass.
- [ ] **T7** Run `npm run graph:ci` — 0 errors.
