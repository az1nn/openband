---
name: openband-domain-modeling
description: Establish ubiquitous language, domain boundaries, and type models for OpenBand DAW concepts.
---

# OpenBand Domain Modeling

Defines ubiquitous language, domain model schemas, and explicit boundary separations for the OpenBand Web Audio DAW platform.

## Core Domain Models (`src/lib/types.ts`)

- **`ProjectDef`**: Master container holding tracks, buses, tempo, time signature, and metadata.
- **`TrackDef`**: Audio or MIDI track definition containing volume, pan, mute, solo, plugins, and region references.
- **`BusDef`**: Sub-mix audio bus routing entity for grouping and master routing.
- **`StemDef`**: Separated audio stem output (e.g., drums, bass, vocals, other from Demucs).
- **`Plugin` / `Pedal`**: DSP processing units with parameters, bypass states, and schema definitions.
- **`CRDT Operation`**: Lamport-timestamped operation payload for real-time collaboration.
- **`AudioRegion`**: Non-destructive audio/MIDI region clip with offset, duration, and gain parameters.
- **`AssetPointer`**: Content-addressed SHA-256 S3/R2 reference for binary audio assets.

## Architectural Layer Boundaries

1. **UI Layer (`app/`, `src/components/`)**:
   - React Native / Web rendering only.
   - Communicates with Audio Engine via MessagePort / event handles. Zero direct AudioBuffer mutations.

2. **Web Audio DSP (`src/lib/`, AudioWorklets, Wasm)**:
   - Headless audio graph processing, time-stretching, parameter scheduling, and bus routing.

3. **State & CRDT Layer (`src/lib/crdt.ts`, `src/lib/yjsCRDT.ts`)**:
   - Operations, snapshots, branching, undo/redo history. Pure state transforms.

4. **Desktop Native Bridge (`src/bridge/`)**:
   - Strict `OpenBandNative` interface isolating Electron/Tauri/Browser I/O calls.
