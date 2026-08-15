# Tasks: Roadmap Genre Templates

- [ ] Read `src/lib/projectTemplates.ts` in full; note the `GenreTemplate` type, `GENRES`, `GENRE_PLUGINS`, `getDrumPattern`, and `generateTracksForGenre` signatures and conventions (Tailwind color strings, trackType values).
- [ ] Add `trap`, `house`, `dancehall` objects to `GENRES` (after the `blues` entry) with the exact fields from design.md.
- [ ] Add `trap`, `house`, `dancehall` entries to `GENRE_PLUGINS` with the plugin presets from design.md.
- [ ] Add `case 'trap'`, `case 'house'`, `case 'dancehall'` to `getDrumPattern` producing idiomatic patterns per design.md (follow the existing switch style exactly; `notes.push({pitch,start,duration,velocity})`).
- [ ] Verify `generateTracksForGenre` correctly resolves the new ids (no hardcoded allow-list). If the New Project UI filters genres by a fixed array, extend it (check `src/components/NewProject.tsx` and `app/` usages of `GENRES`).
- [ ] Add `tests/genreTemplatesRoadmap.test.ts` covering the assertions in design.md (genre presence + bpmRange, plugin chains, drum pattern anchors, generateTracksForGenre output). Follow the existing test style in `tests/projectTemplatesAdvanced.test.ts`.
- [ ] Run `npx tsc --noEmit` (via WSL: `wsl -e bash -lc "cd /home/az1nn/openband && npx tsc --noEmit"`) and fix any type errors.
- [ ] Run the new test via WSL vitest: `wsl -e bash -lc "cd /home/az1nn/openband && npx vitest run tests/genreTemplatesRoadmap.test.ts"` and ensure it passes.
- [ ] No comments in code. Self-documenting names only.
