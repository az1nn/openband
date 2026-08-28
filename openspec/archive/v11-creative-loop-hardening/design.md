# Design — V11 Creative Loop Hardening

## Stress session
```text
100 regenerations
100 variation switches
100 play/stop
50 lock toggles
20 BPM changes
20 key changes
10 promotion retries
multiple close/reopen cycles
```

## Final invariants
```text
history bounded
resources zero after close
no stale result applied
no duplicate durable project
no session state leaked into durable project
no preview cache collision across musical variants
```

## Recovery
Simular:
- async play reject;
- generation reject;
- persistence reject;
- remount after successful persistence;
- restart-like reconstruction with same approvalToken.
