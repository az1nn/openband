# Design — M6: expo-audio Empty-Source Sentinel

## Change
Single-token contract change in `src/hooks/useUniversalAudio.ts`:

```ts
// before
const player = useAudioPlayer(source ?? "");
// after
const player = useAudioPlayer(source || null);
```

`?? null` would NOT coerce an empty string `""` to `null` (empty string is not nullish),
leaving the native empty-URL path broken. `|| null` correctly maps `null`/`undefined`/
`""` all to `null`.

## Rationale
- `useAudioPlayer(null)` is the documented expo-audio "no source yet" sentinel; native
  expo-audio constructs a loadable player without attempting to resolve an empty URL.
- NOTE: a grep shows `useUniversalAudio` currently has no production callers in `src/`/
  `app/`; the earlier claim of "4 other callers use null" is incorrect. The fix is still
  correct and defensive (aligns the sentinel with expo-audio's contract), and zero
  consumers means zero regression risk.
- The downstream `useEffect` guard `if (!source) return` already prevents audio-context
  / `player.replace` side effects when no source is present, so no logic change is
  needed there.
- `play/pause/stop/seekTo` already wrap calls in try/catch and no-op when
  `status.isLoaded` is false, so a null-source player degrades gracefully.

## Verification without native runtime
- The fix is a one-token change aligning with existing callers; web path behavior is
  unchanged (empty `<audio>` src → `play()` rejects, caught).
- A mocked `expo-audio` vitest asserts `useAudioPlayer` receives `null` (not `""`) for
  `null`/`undefined`/`""` inputs, and that `play()` does not throw with no source.
