# Next Step B: WebRTC Voice & Video Collab Chat — Design

## Architecture
- **Signaling**: Extend `backend/src/collabServer.ts` to forward WebRTC ICE candidates and offer/answer SDP payloads between project peers.
- **`src/lib/webrtcCollab.ts`**: Encapsulates `RTCPeerConnection`, local media stream capture (`getUserMedia`), and audio/video track attachments.
- **UI Component**: `CollabVoiceChat` overlay in studio sessions.
