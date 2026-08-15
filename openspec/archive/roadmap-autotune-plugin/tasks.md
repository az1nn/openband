# Tasks: Roadmap Auto-Tune Plugin

- [ ] Read `src/lib/pluginChain.ts` around the `autoPitch`/`autotune` branch (search for `formant` and `autoPitch`/`autotune`) to understand the current no-op and the surrounding node-construction pattern (how other real-time nodes are built and connected).
- [ ] Read `src/lib/keyDetection.ts` and `src/lib/pitchEstimate.ts` (if present) to learn the pitch-detection API to reuse.
- [ ] Create `src/lib/autotune.ts` with `hzToMidi`, `midiToHz`, `CHROMATIC`, and `quantizeToScale` exactly as specified in design.md. Keep it pure (no AudioContext usage).
- [ ] In `src/lib/pluginChain.ts`, import from `./autotune` and replace the void `formant` no-op in the autoPitch branch with real pitch-quantize + shift logic using `quantizeToScale` + key/scale (from params or `detectKey`). Preserve fail-soft behavior and real-time safety. Keep `ScriptProcessor`-style block processing like sibling nodes.
- [ ] Create `tests/autotune.test.ts` for the pure math (snap, tolerance, root/scale, hz/midi round-trip).
- [ ] Create `tests/autotunePlugin.test.ts` building the autoPitch graph against a mock `AudioContext` (provide `createScriptProcessor`, `createBiquadFilter`, `createGain`, `currentTime`, `sampleRate`) and asserting no throw and a returned node.
- [ ] Run `npx tsc --noEmit` via WSL and fix type errors.
- [ ] Run `wsl -e bash -lc "cd /home/az1nn/openband && npx vitest run tests/autotune.test.ts tests/autotunePlugin.test.ts"` and ensure passing.
- [ ] No comments in code.
