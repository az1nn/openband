## Status: SHIPPED

# Roadmap Step 2: Real-Time Collaborative CRDT & WebSocket Sync — Proposal

## Context
OpenBand has client-side CRDT primitives (`crdt.ts`, `snapshotManager.ts`, `presence.ts`), but real-time multi-user project synchronization over WebSockets requires an active server-side sync daemon.

## Objectives
- Implement a WebSocket signaling and CRDT operation broadcast server in `backend/src/collabServer.ts`.
- Connect the frontend `collaboration.ts` hook to the WebSocket server for multi-user real-time state merging and remote cursor broadcasting.
- Add integration tests for CRDT merge resolution and conflict handling.
