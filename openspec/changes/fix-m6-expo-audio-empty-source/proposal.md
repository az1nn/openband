# Proposal — M6: expo-audio Empty-Source Sentinel

## Context
`src/hooks/useUniversalAudio.ts:10` does:

```ts
const player = useAudioPlayer(source ?? "");
```

The expo-audio contract for "no source yet" is `null` (a player loadable later via
`player.replace()`). Every other caller in the repo uses `null`
(`SampleBrowser.tsx`, `MiniPlayer.tsx`, `studio/[id].tsx`, `tabs/index.tsx`). The `?? ""`
coercion converts `null`/`undefined` (and an already-empty `""`) into a literal empty
string and hands it to `useAudioPlayer`.

## Problem
- On **web**, `useAudioPlayer("")` builds an `<audio>` with empty `src` — harmless;
  `play()` rejects and is caught.
- On **native (Expo/iOS/Android)**, `useAudioPlayer("")` tries to resolve an empty
  relative URL → invalid source → player-creation/status errors or undefined
  `isLoaded`. This is the web/native divergence the checkpoint flagged (M6).

Note `??` does NOT catch `""` (empty string is not nullish), so an empty-string source
also reaches the bad path. The existing `useEffect` guard `if (!source) return`
correctly skips side effects, but the broken player is already constructed at line 10.

## Objectives
- Align the sentinel with the rest of the codebase: pass `null` instead of `""` so
  native expo-audio gets a deferred/empty player (no invalid load attempt).
- Keep behavior identical on web; degrade gracefully on native.

## Non-goals
- No refactor of play/pause/seek logic (already try/catch guarded).
- No native-runtime verification (none available here; correctness proven by contract
  alignment + mocked vitest).
