# Roadmap Step 4: Native Desktop Build Pipeline & CI Automation — Proposal

## Context
OpenBand includes Electron configuration (`electron/main.js`, `electron/preload.js`), but automated desktop packaging, code signing configuration, and CI release workflows need end-to-end hardening.

## Objectives
- Finalize Electron build and packaging scripts in `package.json` and `electron/package.json`.
- Add GitHub Actions CI workflow for automated web export, backend build, and Electron cross-platform artifact packaging.
- Add test coverage for desktop bridge preload security and IPC messaging.
