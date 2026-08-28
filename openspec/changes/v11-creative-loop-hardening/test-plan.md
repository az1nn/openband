# Test Plan — V11 Creative Loop Hardening

## Stress
- HS01 100 regenerations bounded
- HS02 100 switches generation-free
- HS03 100 play/stop leaves zero orphan after close
- HS04 50 lock toggles preserve consistency
- HS05 repeated BPM/key invalidation leaves no stale preview
- HS06 history capacity never exceeded

## Idempotency
- HI01 double tap
- HI02 reentrant handler
- HI03 remount
- HI04 simulated restart
- HI05 persistence succeeded but navigation failed

## Cache
- HC01 same BPM/key but different seed != cache key
- HC02 same BPM/key but different locks != cache key
- HC03 same recipe but changed generated content != cache key

## Audio
- HA01 async reject cleanup
- HA02 natural end cleanup
- HA03 stop cleanup
- HA04 repeated dispose idempotent

## Security
- HS07 nested secrets redacted
- HS08 case variants redacted
- HS09 telemetry allowlist only
