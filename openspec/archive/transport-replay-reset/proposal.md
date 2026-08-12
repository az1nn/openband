# Proposal: Reset transport seek on natural end

## Context
OpenBand is an Expo/React Native Web Audio DAW. The studio transport handles
play/pause/stop through `app/studio/hooks.ts` `togglePlay`, backed by
`src/lib/playbackEngine.ts` (`PlaybackEngine`).

## Problem
When a track plays to its natural end, `PlaybackEngine.play` sets
`pausedAt = duration` and fires `onEnded`, which only calls `setEngineActive(false)`
(`app/studio/hooks.ts:684`). The shared `currentSeekRef.current` ref — which is the
seek position passed to the next `engine.play(...)` call (`app/studio/hooks.ts:685`) —
is only updated on an explicit pause (`app/studio/hooks.ts:667`) and on `stopPlayback`
(`app/studio/hooks.ts:733`), never on natural end.

Result: if the user paused at position X, let playback finish, then presses Play
again, `engine.play(currentSeekRef.current)` restarts at X, skipping already-played
audio. `stopPlayback` already resets the ref to 0, so this only affects the
pause→natural-end→play path.

## Objective
On natural end, reset `currentSeekRef.current = 0` so a subsequent Play restarts from
the beginning. Mirror `stopPlayback`. Explicit mid-track pause must continue to
preserve the seek position (only natural end resets).

## Out of scope
- No changes to `PlaybackEngine` internals (`pausedAt`, `onEnded` contract).
- No changes to blob/webAudio fallback path beyond the shared ref.
- No new dependencies.
