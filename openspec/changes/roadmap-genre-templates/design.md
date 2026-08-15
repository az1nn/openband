# Design: Roadmap Genre Templates

## Data structures (existing)
- `GenreTemplate` (defined in `src/lib/projectTemplates.ts`): `{ id, name, icon, defaultBpm, bpmRange:[min,max], defaultKey, description, subgenres:string[], suggestedTracks:{name,color,trackType}[] }`.
- `GENRE_PLUGINS: Record<string, {type:string, params:Record<string,number>}[]>` keyed by genre id.
- `getDrumPattern(genreId, secPerBeat, numBars=8): MIDINote[]` with `switch` cases. `MIDINote = { pitch, start, duration, velocity }`. Standard GM drum map used: 36=kick, 38=snare, 42=hat closed, 46=hat open, 49=crash, 51=ride.
- `generateTracksForGenre(genreId, opts)` builds `TrackDef[]` from `suggestedTracks` and attaches `GENRE_PLUGINS[genreId]` to each track.

## New `GENRES` entries
### trap
- id:"trap", name:"Trap", icon:"🥁", defaultBpm:145, bpmRange:[130,150], defaultKey:"F#m", description:"808s, hi-hat rolls, snare", subgenres:["trap_urban"], suggestedTracks: 808 Bass (bass), Hi-Hats (drums), Snare (drums), Melodia (vocal).

### house
- id:"house", name:"House", icon:"🏠", defaultBpm:124, bpmRange:[120,130], defaultKey:"Am", description:"Four-on-the-floor, synth bass, vocal chops", subgenres:[], suggestedTracks: Kick Bass (drums), Drums (drums), Synth Bass (bass), Vocal Chops (vocal).

### dancehall
- id:"dancehall", name:"Dance Hall", icon:"🎶", defaultBpm:100, bpmRange:[90,110], defaultKey:"Gm", description:"Dembow, brass, vocal samples", subgenres:[], suggestedTracks: Dembow Drum (drums), Bass (bass), Brass (keys), Vocal Sample (sample).

## New `GENRE_PLUGINS` entries
- trap: distortion {drive:0.5,tone:0.6,mix:0.6}, compressor {threshold:-18,ratio:4,attack:3,release:40}
- house: compressor {threshold:-16,ratio:4,attack:2,release:20} (sidechain feel), reverb {decay:1.5,mix:0.2}
- dancehall: reverb {decay:2.5,mix:0.3}, delay {time:375,feedback:30,mix:0.25}

## New `getDrumPattern` cases
- **trap**: every beat a long 808 kick (pitch 36) with extended duration; snare (38) on beats 2 & 4; 16th-note hi-hats (42) with velocity variation and occasional 32nd rolls near bar ends.
- **house**: four-on-the-floor kick (36) on every beat; off-beat open hat (46) on the "and"; clap/snare (38) on beats 2 & 4; light ride (51) 8ths.
- **dancehall**: dembow pattern — kick (36) and snare/clap (38) in the classic 3-3-2 feel across the bar; hats (42) on offbeats; bass hits (35) following the kick.

## State / side effects
None beyond pure data + pure pattern generation. No React state, no new files beyond tests.

## Component mapping
- `NewProject` (src/components/NewProject.tsx) reads `GENRES` to render genre choices; new genres automatically appear. No change required there unless it filters by a fixed list (verify during implementation).

## Tests
- `tests/genreTemplatesRoadmap.test.ts`:
  - Each new genre present in `GENRES` with correct `bpmRange`.
  - `GENRE_PLUGINS[id]` contains expected plugin types.
  - `getDrumPattern('trap'|'house'|'dancehall', secPerBeat, 1)` returns non-empty arrays with expected anchor hits (e.g., house has a kick on every beat; trap has extended 808 kick; dancehall has dembow snare placement).
  - `generateTracksForGenre('house')` returns the 4 suggested tracks.
