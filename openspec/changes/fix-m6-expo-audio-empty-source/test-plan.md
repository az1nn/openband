# Test Plan — M6: expo-audio Empty-Source Sentinel

## Unit under test
- `useUniversalAudio(source?)` hook in `src/hooks/useUniversalAudio.ts`.

## Approach
Mock `expo-audio` so `useAudioPlayer` is a spy and `useAudioPlayerStatus` returns a
fixed `isLoaded: false` status. Render the hook with `@testing-library/react-hooks`.

## Cases
1. **Null/undefined/empty → null sentinel** — for `source` = `null`, `undefined`, `""`,
   assert the spy's first call received `null` (never `""`).
2. **Real source → passed through** — for a URL string, assert the spy received the URL.
3. **Play with no source** — call `result.current.play()`; assert it does not throw and
   `result.current.isLoaded` is `false` (graceful no-op).

## Non-regression
- Other `useUniversalAudio` consumers (`SampleBrowser`, `MiniPlayer`, `studio/[id]`,
  `tabs/index`) already pass `null`; no behavior change for them.
- No backend or 3D changes.
