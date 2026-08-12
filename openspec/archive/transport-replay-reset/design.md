# Design: Reset transport seek on natural end

## Affected files
- `app/studio/hooks.ts`

## Current mechanics (verified)
- `currentSeekRef` (useRef, `app/studio/hooks.ts:562`) starts at 0.
- Explicit pause: `togglePlay` calls `engine.pause()` then
  `currentSeekRef.current = engine.getCurrentTime()` (`app/studio/hooks.ts:667`) — preserves position.
- Natural end: `engine.onEnded = () => setEngineActive(false)` (`app/studio/hooks.ts:684`)
  does NOT touch `currentSeekRef`.
- `engine.play(currentSeekRef.current)` (`app/studio/hooks.ts:685`) resumes from the ref.
- `stopPlayback` resets `currentSeekRef.current = 0` (`app/studio/hooks.ts:733`).

## Change
Wrap the `onEnded` callback so it both deactivates the engine and resets the seek ref:

```ts
engine.onEnded = () => {
  setEngineActive(false);
  currentSeekRef.current = 0;
};
```

This mirrors `stopPlayback`'s reset without double-resetting (stop sets its own ref;
onEnded fires only after natural playback completion, not after stop).

## Behavior matrix (after fix)
| Action sequence                  | next Play starts at |
| -------------------------------- | ------------------- |
| Pause at X → Play                | X (preserved)       |
| Natural end → Play               | 0 (reset)           |
| Stop → Play                     | 0 (already reset)   |

## Why no PlaybackEngine change
`PlaybackEngine` already exposes `pausedAt` and fires `onEnded`. The DAW-side ref that
drives the next `engine.play(seek)` lives in `hooks.ts`, so the reset belongs there.
