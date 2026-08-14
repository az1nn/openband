# Roadmap Step 2: Real-Time Collaborative CRDT & WebSocket Sync — Design

## Architecture
- **WebSocket Protocol**: JSON-encoded CRDT operations (`{ type: 'crdt-op', clientId, op, lamport }`) and presence heartbeats (`{ type: 'presence', cursor }`).
- **Backend**: Express + `ws` server at `backend/src/collabServer.ts` managing room subscriptions per project ID.
- **Frontend**: `src/lib/collaboration.ts` auto-reconnecting WebSocket client with optimistic local updates and vector clock state reconciliation.
