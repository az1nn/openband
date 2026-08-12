# Design: Studio Components Responsivity Polish

## Layout Changes

### 1. Top Toolbar & Navigation
- Group secondary tools into a collapsible "Tools" dropdown or cleaner categorized modal on mobile (`resp.isMobile`), keeping primary transport (Play, Record, Stop, Loop, Undo/Redo) prominent.
- Ensure all icon buttons have a minimum touch target of 44x44pt on mobile.

### 2. Timeline Sizing & Zoom
- Replace the rigid `TIMELINE_WIDTH = 1200` constant in `app/studio/parts.tsx` with a responsive calculation:
  ```ts
  const minTimelineWidth = resp.isMobile ? Math.min(windowWidth - resp.tracksSidebarWidth, 600) : 1200;
  const timelineWidth = Math.max(minTimelineWidth, duration * pxPerSec);
  ```

### 3. Touch Targets & Spacing
- Increase track control buttons (`M`, `S`, `R`, `V`, `P`, `🎹`) and header action buttons to minimum `w-8 h-8` (or `w-9 h-9` with generous padding) on mobile.
- Increase zoom buttons and undo/redo button dimensions.

### 4. Bottom Panel Responsiveness
- Adjust bottom panel max heights dynamically (`resp.isMobile ? 180 : 280`).
- Ensure mixer channel widths adapt cleanly (`resp.isMobile ? 70 : 90`) and fader touch areas have larger hitboxes.
