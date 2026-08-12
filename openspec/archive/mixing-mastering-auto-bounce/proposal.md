# Proposal: Automatic Mixdown Transfer to Mastering Suite

## Context
When users navigate from the DAW Studio (`app/studio/[id].tsx`) to the Mastering Suite (`app/mastering/index.tsx` or `MasteringSuite`), the mastering upload/import interface currently prompts the user to manually upload/drop audio files. It does not automatically capture or bounce the current studio project tracks / stem mixdown into the mastering suite.

## Objectives
1. Automatically capture the current project mixdown / audio buffer when opening the Mastering Suite from the Studio DAW.
2. Provide a seamless "Send to Mastering" or auto-load mechanism from Studio to Mastering without requiring manual file re-upload.
3. Ensure offline-first rendering (`renderTracksToUrl` / `universalAudio` mixdown) populates the mastering audio URI instantly.
