# Design Baseline — #43 Native Build Verification

This document exists only to bind the Human Design Gate to one immutable design intent.

Approved implementation envelope after gate:

- refactor the existing conditional Android/Electron CI jobs;
- introduce a repository-owned native-build evidence harness;
- classify requested targets as `PASS`, `FAIL` or `BLOCKED`;
- preserve evidence even when the build fails, then enforce non-PASS as a failing job;
- validate expected native artifacts and record exact SHA, size and SHA-256;
- retain opt-in `native-build` / manual scheduling;
- keep application runtime and bridge behavior unchanged;
- do not modify production signing credentials, signing policy, keystore/notarization secrets or publication paths.

Any signing/security-sensitive requirement is outside this baseline and requires T4 reclassification plus a fresh Human Design Gate.
