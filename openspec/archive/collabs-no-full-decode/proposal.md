# Proposal: Derive Collabs Tab from Index Metadata Without Full Decode

## Context
The Library "Colaborações" (collabs) tab currently runs `loadProject(id)` for every project in `projectIndex` when tapped, causing a full ProjectData decode (tracks, regions, embedded audio) across all projects.

## Objectives
1. Include `parentProjectId` in `listProjectIndex()` and `saveProject()`.
2. Derive collab items in `app/tabs/library.tsx` directly from `projectIndex` metadata (`meta.parentProjectId`) without calling `loadProject(id)`.
