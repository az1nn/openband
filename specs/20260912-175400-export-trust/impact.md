# Architecture Graph Evidence

Graph preflight on the #49 design branch:

| Target | Direct dependents | Transitive dependents | Risk |
| --- | ---: | ---: | --- |
| `src/lib/universalAudio.ts` | 26 | 140 | HIGH |
| `src/components/BounceDialog.tsx` | 1 | 63 | HIGH |
| `app/studio/StudioModals.tsx` | 4 | 5 | HIGH |
| `src/lib/audio.ts` | 15 | 123 | HIGH |
| `src/lib/midiSynth.ts` | 6 | 71 | HIGH |
| `src/lib/busRouter.ts` | 5 | 142 | HIGH |
| `src/lib/pluginChain.ts` | 11 | 147 | HIGH |
| `app/studio/[id].tsx` | 4 | 4 | HIGH |

The Graph supports T3-or-higher treatment but does not by itself require T4. Semantic review keeps T3 because the approved design avoids new DSP algorithms, persistence changes and destructive data semantics. Any implementation departure into correctness-critical DSP/codec math requires reclassification and a new Design Gate.
