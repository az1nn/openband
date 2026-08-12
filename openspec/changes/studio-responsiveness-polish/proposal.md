# Proposal: Studio Components Responsivity Polish

## Context
The DAW studio screen (`app/studio/[id].tsx`, `app/studio/parts.tsx`, `app/studio/StudioModals.tsx`) breaks on mobile viewports due to cramped toolbars, hardcoded timeline widths (1200px), small touch targets (<44px), vertical squashing between the arrangement canvas and bottom panels, and narrow mixer faders.

## Objectives
1. Make the top toolbar responsive with a structured overflow/dropdown menu on mobile.
2. Adapt timeline scaling and minimum width dynamically to smaller mobile viewports.
3. Increase touch target sizes across track headers, zoom controls, and transport buttons to meet mobile accessibility standards (≥44px).
4. Make bottom panels (Mixer, FX, Groups, Chords, etc.) adapt fluidly in height and channel strip layout on mobile vs. desktop.
5. Enhance mixer channel fader touch usability.
