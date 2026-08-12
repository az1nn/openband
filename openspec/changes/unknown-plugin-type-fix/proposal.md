# Proposal: Log and Validate Unknown Plugin Types in Audio Chains

## Context
When processing audio plugin chains in `src/lib/pluginChain.ts` (`applySinglePlugin`) and `src/lib/mastering.ts` (`applyMasteringPlugin`), unknown or unsupported plugin types fall into the `default` switch case and pass audio through silently (`source.connect(ctx.destination)` or returning buffer unchanged). This causes misconfigured chains or unknown/legacy preset plugins to be silently inaudible or bypassed instead of alerting or safely handling.

## Objective
Add explicit warning logs and handling for unknown plugin types across audio plugin chain processors (`src/lib/pluginChain.ts`, `src/lib/mastering.ts`, and `src/lib/pedalboardDsp.ts`) so misconfigurations or legacy types are properly logged and handled.
