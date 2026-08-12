# Proposal: Preserve Stereo Channels in Native Audio Mixdown

## Context & Problem
In `src/lib/universalAudio.ts`, `decodeAudioPureJS` currently averages stereo/multi-channel audio buffers into a single mono channel (`sum / numChannels`). Furthermore, `renderMixdownNative` writes that single mono channel data to both left and right output channels, causing all stereo sources and recordings to collapse into mono during native export/bounce.

## Objectives
1. Update `decodeAudioPureJS` to decode and return per-channel `Float32Array[]` buffers (preserving multi-channel and stereo separation).
2. Update `renderMixdownNative` to process stereo/multi-channel decoded audio buffers independently for left and right outputs, applying track gain and pan correctly across stereo channels.
3. Ensure all TypeScript type checks and test suites pass successfully.
