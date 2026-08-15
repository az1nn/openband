# Proposal: Roadmap Genre Templates — Trap, House, Dance Hall

## Context
The `NOVO PROJETO` roadmap section lists genre templates that are incomplete or missing:
- **Trap** — only exists as a `hiphop` subgenre; no dedicated `trap` genre, no 808/hi-hat-roll/snare drum pattern, no BPM 130–150 default, no distortion/saturation plugin chain.
- **House** — only exists as an `edm` subgenre; no dedicated `house` genre with four-on-the-floor kick, synth bass, vocal chops, or sidechain-compressor preset, no BPM 120–130 default.
- **Dance Hall** — entirely absent; no genre, no dembow rhythm pattern, no brass/vocal-sample tracks, no reverb/delay send.

`src/lib/projectTemplates.ts` already defines `GENRES`, `GENRE_PLUGINS`, `getDrumPattern(genreId, ...)`, and `generateTracksForGenre(...)`. This change extends those structures to fully cover Trap, House, and Dance Hall so the New Project flow offers them.

## Objectives
1. Add `trap`, `house`, `dancehall` entries to `GENRES` with correct BPM ranges, default keys, and suggested tracks per the roadmap.
2. Add matching `GENRE_PLUGINS` entries (distortion/saturation for trap; sidechain compressor for house; reverb/delay for dancehall).
3. Add `getDrumPattern` cases producing idiomatic patterns (808 roll for trap, four-on-the-floor for house, dembow for dancehall).
4. Ensure `generateTracksForGenre` returns correct tracks for the new genres.
5. Add tests verifying genre lookup, BPM ranges, plugin chains, and generated drum patterns.
