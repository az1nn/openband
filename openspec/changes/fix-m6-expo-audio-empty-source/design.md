# Design — M6: expo-audio Empty-Source Sentinel

## Change
Single-token contract change in `src/hooks/useUniversalAudio.ts`:

```ts
// before
const player = useAudioPlayer(source ?? "");
// after
const player = useAudioPlayer(source ?? null);
```

(`source || null` is equivalent and also acceptable; `?? null` is preferred to preserve
a legitimate empty-string source if one ever exists — though none do today.)

## Rationale
- `useAudioPlayer(null)` is the documented expo-audio "no source yet" sentinel and is
  what 4 other callers already pass. Native expo-audio constructs a loadable player
  without attempting to resolve an empty URL.
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
