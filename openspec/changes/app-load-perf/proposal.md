# Proposal: App Page-Load Performance Polish

## Context
Users report pages still load slowly. Profiling the Expo Router app shows the entry bundle
(`app/_layout.tsx`) eagerly ships `@supabase/supabase-js` (~700K) + the i18next stack (~1.75M)
for every page — but deferring those requires a broad async refactor that is high-risk and
out of scope here. The highest, lowest-risk wins are on the two most-visited screens:

- **Library tab** (`app/tabs/library.tsx`) calls `loadProject(id)` (full JSON decode) for
  **every** saved project on mount, synchronously, even though cards only need title +
  lastSaved + genre/key/bpm. This blocks the Library screen rendering for users with many
  projects.
- **Feed tab** (`app/tabs/index.tsx`, the default landing) eagerly bundles the 488-line
  `NewProject` and `OnboardingFlow` components into the landing chunk, and on mount fires
  `preloadPreview` for the first 6 posts — each `preloadPreview` allocates an
  `OfflineAudioContext` and renders a short WAV (main-thread work) even when the tab is not
  visible.

## Objectives
1. Library: render the project list from lightweight index metadata only; stop full-decoding
   every project on mount. Load the full `ProjectData` lazily, only when a project is opened.
2. Feed: shrink the landing chunk by lazy-loading `NewProject` + `OnboardingFlow`; gate preview
   preloading behind tab visibility and cap the count so it never competes with first paint.
3. Keep all behavior (favorites, cloud, open) intact — no feature regression.

## Non-Goals
- Deferring `@supabase/supabase-js` / i18next from the root entry bundle (requires a broad
  async-client refactor; tracked separately).
- Touching Three.js / AudioContext startup (already correctly deferred).
