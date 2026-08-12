# Design: Automatic Mixdown Transfer to Mastering Suite

## Architecture & Flow

### 1. Transfer Mechanism (`app/mastering/index.tsx` & Studio Integration)
- When opening Mastering from Studio, pass the project state or pre-rendered mixdown URL (or render on mount using `renderTracksToUrl` or `universalAudio.mixdownTracks`).
- Update `MasteringSuite` component to accept an optional initial `audioUri` or `tracks` prop so it can automatically render/load the project audio without forcing manual file selection.
- If no pre-rendered audio URI is provided, display the file upload drop zone as a fallback, but when launched from Studio with tracks, automatically trigger mixdown rendering and feed the resulting blob URL into `MasteringSuite`.

### 2. State & Navigation
- Store current studio export/mixdown state in router params or a shared session store (`projectStore` or temporary context) so `app/mastering/index.tsx` reads it on load.
