# Design: Studio Edit Freeze Fix

## Architecture Changes
- **Cache Key Refinement in `renderTracksCached`**:
  Update the cache key generation in `app/studio/hooks.ts` to exclude live control parameters (`volume`, `pan`, `muted`, `solo`) from the track signature used for caching `renderTracksToUrl`.
  Structural properties (`id`, `regions`, `midiNotes`, structural plugins) remain in the cache key.
- **Live Node Updates**:
  Rely on `PlaybackEngine` live Web Audio node updates (`setTrackVolume`, `setTrackPan`, `setMuted`, `setSolo`) for real-time control changes during playback.

## Files to Modify
- `app/studio/hooks.ts`: Modify `renderTracksCached` cache key to exclude `v`, `p`, `m`, `s`.
