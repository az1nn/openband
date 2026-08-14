# Future Roadmap Implementation (Stem Queue & 3D LOD) — Design

## 1. Stem Separation Queue (`backend/services/queue.ts`)
- Maintain job status (`queued`, `processing`, `completed`, `failed`) and progress percentage (0–100).
- Expose GET `/api/extract/progress/:jobId` SSE endpoint for live client progress updates.

## 2. 3D Scene Performance (`app/virtual-studio.tsx`)
- Add `document.addEventListener("visibilitychange", ...)` to pause rAF render loops when the tab is hidden.
- Implement object frustum culling checks and simplified geometry LOD for background elements.
