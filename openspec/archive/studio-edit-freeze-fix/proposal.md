# Proposal: Studio Edit Freeze Fix (Live Control vs Structural Audio Cache)

## Problem
In OpenBand's Studio DAW, `renderTracksCached` in `app/studio/hooks.ts` invalidates its cache on any signature change including track volume (`v`), pan (`p`), mute (`m`), solo (`s`), and plugin parameter tweaks. When invalidated, `renderTracksToUrl` re-runs a full synchronous main-thread `OfflineAudioContext` render per track/plugin chain. For long projects or frequent edits (like adjusting volume, pan, mute, or EQ), this freezes the main UI thread during playback.

## Objectives
1. Distinguish between **structural audio changes** (region audio data, time stretching, stem file changes, heavy plugin DSP changes) and **live control changes** (volume, pan, mute, solo, EQ gain).
2. Prevent cache invalidation in `renderTracksCached` for live control changes (`volume`, `pan`, `muted`, `solo`) so minor tweaks do not trigger heavy synchronous `OfflineAudioContext` re-renders.
3. Ensure active Web Audio nodes (`GainNode`, `StereoPannerNode`) handle live control changes in real-time without re-rendering backing audio buffers.
