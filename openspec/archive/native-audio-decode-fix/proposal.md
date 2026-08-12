# Proposal: Fix Native Pure-JS Audio Decode for Variable Bit-Depth WAVs

## Context
In `src/lib/universalAudio.ts`, `decodeAudioPureJS` provides a fallback audio decoder for native platforms (iOS/Android/desktop) when `AudioContext` is unavailable or for file decoding. However, it currently assumes a strict 16-bit WAV with a fixed 44-byte header offset and returns silence (`0.5s` of zeros) for any other bit-depth (8-bit, 24-bit, 32-bit) or non-WAV formats. This causes native stem mixdowns and recordings to produce no audio when using 24-bit or 32-bit WAVs or other audio formats.

## Objectives
1. Dynamically scan RIFF/WAVE chunk headers (`fmt ` and `data`) rather than assuming a fixed 44-byte header offset.
2. Support variable PCM bit depths: 8-bit unsigned, 16-bit signed, 24-bit signed, and 32-bit float/int WAV files.
3. Provide robust handling for non-WAV files (e.g. MP3 / ID3 / MPEG headers) to prevent silent output.
