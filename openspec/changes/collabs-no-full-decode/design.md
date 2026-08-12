# Design: Collabs No Full Decode

## Changes
1. `src/lib/projectStore.ts`:
   - Ensure `listProjectIndex()` return type includes `parentProjectId?: string`.
   - Ensure `saveProject()` stores `parentProjectId: data.parentProjectId` in index entry.
2. `app/tabs/library.tsx`:
   - Update collabs `useEffect` to filter `projectIndex` entries where `meta.parentProjectId` is truthy.
   - Map entries to collab list items containing metadata fields (`title`, `lastSaved`, `genre`, `key`, `bpm`, `coverUrl`, `metadata: null`) without invoking `loadProject(id)`.
