---
name: openband-implement
description: Execute single vertical task tickets while strictly respecting repository conventions and test gates.
---

# OpenBand Implementation Guidelines

Executes implementation tasks with strict adherence to OpenBand repository standards and conventions.

## Core Rules

1. **Desktop Bridge Isolation**:
   - NEVER use `require('fs')`, `ipcRenderer`, or Tauri APIs directly in `app/` or `src/`.
   - ALWAYS use `OpenBandNative` from `@bridge`.

2. **Audio Subsystem**:
   - Use `expo-audio` (Expo SDK 57), NEVER `expo-av`.
   - Handle browser autoplay policies via `ensureContext()` on user interaction.

3. **Styling & Design Tokens**:
   - Use Tailwind v3 syntax (`@tailwind base/components/utilities`).
   - Prefer design system components from `src/components/`.

4. **Code Quality & Documentation**:
   - Add code comments sparingly (explain *why*, not *what*).
   - Zero dead code or unused imports.
   - Update `docs/features-implementation.md` for visual or structural layout updates.

5. **Mandatory Verification**:
   - Run `npx tsc --noEmit` and the verification test suite before concluding any task.
