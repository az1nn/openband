# Audio Transport Contract

This contract captures cross-feature transport invariants. Implementation detail may evolve, but a feature changing these guarantees must update its Spec Kit plan and this contract when the change is intentionally durable.

## Boundary

- Studio transport owns the logical play/pause/stop/seek timeline.
- Audio scheduling/clock work lives in the audio layer; React rendering is a consumer, not the master clock.
- Web and native players may use different adapters, but user-visible transport semantics must remain equivalent.

## Invariants

1. **Gesture-first Web resume.** When playback starts from a user gesture, the Web `AudioContext` resume/unlock request must be issued synchronously before awaited rendering/preparation work consumes the activation window.
2. **Playback failure is observable.** Autoplay/player failures must reach the caller so UI can offer retry; transport code must not convert a failed play into apparent success.
3. **Hot clock isolation.** High-frequency playhead updates must not force the entire Studio tree to re-render on every clock tick. Keep the hot playhead path isolated from heavy UI state.
4. **Stop is a reset.** Stop pauses active playback, stops the running clock/metronome path, and resets the logical playhead to the beginning.
5. **Seek is bounded.** Relative/absolute seeking cannot produce a negative logical position and must keep player and visible playhead aligned.
6. **Scene/render clocks are independent.** 3D/render frame rate must never gate or derive the audio timeline.

## Evidence surfaces

Primary implementation/evidence lives in the Studio transport handlers, audio/clock modules, playhead store, and their tests under `tests/`. Use the Architecture Graph to determine current impact before changing shared transport code.

## Change rule

A change to clock ownership, autoplay handling, cross-runtime transport semantics, or hot-path state ownership is at least T3 because it changes a cross-feature/runtime contract. Deterministic DSP or corruption/loss risk may elevate it to T4.
