# Design: App Page-Load Performance Polish

## P1 — Library: index-metadata list, lazy full load

- `app/tabs/library.tsx` builds its `projects` memo from `listProjectIndex()` metadata
  (`meta.title`, `meta.lastSaved`, and ideally `meta.genre`/`meta.key`/`meta.bpm` if the
  index stores them). It must **no longer** call `loadProject(id)` for every id on mount.
- The full `ProjectData` (with tracks/regions) is required only when the user taps a card to
  open it. If the card's `onPress` currently relies on already-loaded `metadata`, change it to
  load on demand (`loadProject(id)` inside the press handler / navigation effect) before
  routing to the studio.
- `getFavoriteProjects()` is already index-only (localStorage read) — keep.
- If the index entry lacks `genre`/`key`/`bpm`, the card simply omits those chips instead of
  paying a full decode. Acceptable trade for the speedup. (Confirm the index shape during
  implementation; if it already stores them, surface them.)

## P2 — Feed: smaller landing chunk + guarded preloads

- `NewProject` and `OnboardingFlow` are imported statically at the top of
  `app/tabs/index.tsx`. Replace with a lazily-resolved import so they live in their own chunk
  and are only fetched when `showNewProject` / `showOnboarding` becomes true. Use
  `React.lazy` + `Suspense`, or a `useState` + `useEffect`/`import()` pattern consistent with
  the repo's React-Native-Web constraints (no `next/dynamic`).
- The preview-preload `useEffect` (lines 131–147):
  - Only run `runPreloads` when `document.visibilityState === "visible"` (web) — skip while the
    tab is hidden / backgrounded.
  - Cap to the first **3** posts (not 6).
  - Keep `requestIdleCallback` deferral (already present).

## Verification
- `npx tsc --noEmit`, `cd backend && npx tsc --noEmit`, `npx vitest run`, `npm run test:legacy`,
  `npm run build` must all pass.
- Behavior check: Library still lists projects and opens them; Feed still plays/likes and shows
  New Project / Onboarding when triggered.
