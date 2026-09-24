---
name: native-mixdown-and-blob-management
description: Canonical pattern for cross-runtime audio mixdown and centralized blob URL lifecycle management
source: reconciled
updated_at: '2026-09-23'
---

# Native Mixdown and Blob URL Management

## Canonical ownership

Use `src/lib/universalAudio.ts` for cross-runtime mixdown and blob URL lifecycle. Do not introduce a parallel renderer solely for chunking or platform branching unless a Spec Kit feature proves a separate owner is required.

Web rendering uses `OfflineAudioContext`. Native-compatible fallback rendering is owned by `UniversalAudioSystem.renderMixdownNative()`, including pure-JS WAV decoding, source-window selection, stereo mixing, pan/gain application, and WAV encoding.

## Blob URL lifecycle

Use the tracked helpers exported by `universalAudio.ts`:

- `createTrackedBlob(blob)`
- `markBlobActive(url)`
- `revokeTrackedBlob(url)`

The registry bounds URL lifetime and count. Avoid scattered `URL.createObjectURL()` calls without a matching ownership/revocation strategy.

## Mixdown invariants

1. Respect solo/mute before rendering.
2. Resolve persisted `asset://` references before fetch/decode.
3. Apply the canonical region source window (`offset` / `length`) instead of replaying every region from source zero.
4. Clamp source reads to decoded buffer bounds and project render bounds.
5. Preserve stereo channels where the decoder provides them.
6. Keep Web and native source-window semantics equivalent.
7. Revoke temporary blob URLs after rendering.
8. Report progress without making progress callbacks correctness dependencies.

## Native decoder guidance

The native fallback may decode PCM WAV in pure JS when Web Audio is unavailable. RIFF parsing must scan actual chunks rather than assuming a fixed 44-byte data offset, respect channel count and sample format, and fail safely for unsupported media instead of returning fabricated audio.

## Resource ownership

Audio contexts, worklets, media streams, object URLs, temporary nodes, and decoder buffers need explicit teardown. Prefer shared/canonical audio ownership over module-level contexts.

## Verification

When changing this area, cover:

- stereo left/right preservation;
- source offset/length agreement across Web and native paths;
- solo/mute and pan behavior;
- malformed/unsupported WAV handling;
- blob URL cleanup on success and failure;
- zero/empty-duration behavior;
- full export regression through the repository CI gate.

Do not keep a second renderer implementation merely because tests can exercise it; runtime ownership must be explicit.
