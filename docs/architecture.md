# OpenBand Architecture

This document describes current system boundaries. Feature history belongs in `specs/`; decisions that change these boundaries belong in `docs/adr/`.

## Topology

```text
Expo Router UI (`app/`)
        ↓
frontend/domain (`src/`)
   ├─ components
   ├─ state/audio/domain libraries
   └─ native bridge (`src/bridge/`)
        ↓                     ↓
Browser / mobile APIs      Electron host (`electron/`)

UI/domain ──HTTP──> Node/Express API (`backend/`)
                     └─ SQLite / Supabase / external services as route needs require
```

## Runtime stack

- Expo SDK 57, Expo Router, React 19 and React Native 0.86.
- Web is exported through Expo; Android uses the Expo/React Native project.
- Desktop packages the web application with Electron.
- Backend is Node.js + Express + TypeScript.
- Audio uses `expo-audio` and Web Audio/native fallbacks by runtime.
- Three.js virtual-studio screens are web-oriented; see `docs/3d-scene-guidelines.md`.

`package.json` and `backend/package.json` are authoritative for exact dependency versions.

## Boundaries

### UI and domain

`app/` owns routing/screens. Reusable UI and domain behavior live under `src/`. Screens should delegate reusable state, audio and data behavior rather than becoming independent subsystems.

### Native bridge

Runtime-specific file/dialog/device operations cross `src/bridge/`. `src/bridge/index.ts` selects Electron, Tauri stub, or browser implementation and exports `OpenBandNative`.

Frontend code in `app/` and `src/` must not call Node filesystem, Electron IPC or Tauri APIs directly. Use `@bridge` / `OpenBandNative`.

### Backend

`backend/` owns server-side HTTP routes and integrations that require server execution, credentials or durable server storage. Frontend code consumes it through explicit API boundaries rather than importing backend implementation.

### Persistence and collaboration

Persistence exists across local/runtime-specific storage and server/cloud capabilities. Any change to persistence models, synchronization semantics, CRDT behavior or cross-runtime storage contracts is at least T3; corruption/loss or concurrency-critical work is T4.

### Audio/DSP

Audio behavior spans web and native runtimes. Deterministic DSP, timing, rendering and export changes require domain-specific tests; correctness-critical deterministic DSP is T4.

## Durable knowledge

- Constitution: `.specify/memory/constitution.md`
- Agent workflow: `AGENTS.md`
- Current architecture: this file
- Decisions: `docs/adr/`
- Cross-feature contracts: `docs/contracts/`
- Feature intent/history: `specs/<feature>/`

Do not copy operational status into these documents. GitHub Issues/PRs own status; Git owns history.
