# Audio Export Contract

## Scope

This contract defines the launch-grade Web Studio audio-export boundary introduced by `specs/20260912-175400-export-trust/spec.md` for Issue #49.

It governs successful project-to-WAV export. Video export, portable project archives and optional codecs are separate capabilities.

## Source snapshot

A Studio export is rendered from one invocation snapshot. The snapshot contains the complete track definitions needed by the renderer plus current BPM, optional mood, buses and active master-rack plugins.

Asynchronous export must not reread partially changed UI state after rendering begins.

`asset://` remains the persisted identity for local audio. Export resolves that identity through the existing asset boundary; it does not replace persisted identity with `blob:` URLs.

## Mixer semantics

For export:

- track `volume` uses the persisted Studio percentage scale, 0–100, and is normalized to Web Audio gain 0–1;
- track `pan` uses the persisted Studio percentage scale, -100–100, and is normalized to Web Audio pan -1–1;
- mute/solo must determine the audible track set consistently;
- bus volume retains the existing normalized Studio bus scale;
- enabled track plugin chains and the active master-rack chain that belong to the full Studio offline renderer are part of the launch export result.

This contract does not add new bus-plugin, live-modulation or mastering semantics that the owning renderer does not already support.

## Format truth

The guaranteed launch format is WAV.

A successful result must:

- be represented as `audio/wav`;
- contain valid RIFF/WAVE structure and a non-empty data payload;
- use a `.wav` filename;
- never be labeled AIFF, FLAC or MP3 unless that codec was genuinely encoded.

UI controls must not claim a bit depth or sample rate that the invoked renderer did not actually use.

## Strict success / failure

Export success means the requested snapshot rendered as one trustworthy WAV. The strict export path must fail instead of silently omitting required content when any of these occur:

- durable local asset resolution fails;
- source fetch/decode fails;
- an enabled track effect required by the snapshot fails;
- the active master-rack render fails;
- the Web offline renderer fails;
- no renderable project content exists.

An intentionally silent mixer state is not by itself a structural export failure. Audible-energy requirements are verified with a deterministic fixture whose intended output is audible.

No fabricated silent/header-only placeholder may be presented as a successful project mix.

## Side effects

Audio export is read-only with respect to the project model and durable storage.

Success or failure must not:

- mutate tracks or mixer state;
- save a modified project snapshot as a side effect;
- rewrite, delete or re-key `asset://` records;
- alter the derived project index.

Downloaded-file creation is the only intended external side effect of a successful export.

## Caching

Launch WAV export is one-shot and snapshot-bound. Playback render caches are not export authority and must not be reused when they can omit current mixer state.

## Verification boundary

Verification must include a deterministic audible fixture proving WAV structure/decodability and meaningful mixer-state effects (mute/solo, relative volume and pan), plus explicit missing/corrupt-source failure. Evidence is valid only for the exact verified implementation HEAD.
