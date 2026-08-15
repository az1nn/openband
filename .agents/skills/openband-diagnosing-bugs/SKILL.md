---
name: openband-diagnosing-bugs
description: Structured cross-platform bug diagnosis across Web, Android, iOS, and Desktop runtimes.
---

# OpenBand Bug Diagnosis Workflow

Structured, root-cause bug diagnosis across Web, Android, iOS, Electron, and Tauri runtimes.

## Diagnosis Steps

1. **Reproduce & Isolate Runtime**:
   - Determine target environment: Browser (AudioContext constraints), Expo Native (Android/iOS), Electron, or Express backend.

2. **Trace End-to-End Data Flow**:
   - Trace path: `UI Event` ➔ `Context / Store` ➔ `CRDT / Worker` ➔ `Audio Engine / Bridge`.

3. **Identify Root Cause**:
   - Fix underlying logic defects. NEVER suppress errors with empty try-catch blocks or type assertions.

4. **Write Reproduction Test**:
   - Add a regression test in `tests/` capturing the issue before writing the fix.

5. **Fix & Verify**:
   - Apply fix, verify reproduction test passes, and execute full `openband-test-gate`.
