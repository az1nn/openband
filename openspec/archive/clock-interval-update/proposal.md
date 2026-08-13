# Proposal: clockManager ignores interval change while running

## Context
`src/lib/clockManager.ts` exports `startClock(intervalMs)` which is the entry
point for starting the metronome / master clock worker used by `clockManager`.
The function is called from studio and recording contexts that may want to
adjust the tick granularity at runtime.

## Problem
On line 40 the guard is:

```ts
if (isRunning || Platform.OS !== "web") return;
```

When `isRunning` is `true`, every subsequent call to
`startClock(newInterval)` returns immediately without effect. The caller's
requested `newInterval` is silently ignored and the existing worker continues
ticking at whatever interval it was originally started with. There is no way
to change the interval without first calling `stopClock()`.

## Objective
Allow `startClock(newInterval)` to update the worker interval even when the
clock is already running, without leaking duplicate workers. The default
`25` ms interval must remain the default argument value.
