# Design: Stem Queue SSE & Virtual Studio Visibility Pause

## 1. Backend Stem Separation Queue & SSE Progress (`backend/services/queue.ts`, `backend/routes/extract.ts`)
- **Job States**: `JobStatus = "queued" | "processing" | "completed" | "failed"` (mapping legacy `"pending"` to `"queued"`).
- **Progress Tracking**: Each job includes `progress: number` (0 to 100). During processing, progress updates incrementally (e.g., 0% -> 25% -> 50% -> 75% -> 100%).
- **SSE Endpoint**: `GET /api/extract/progress/:jobId`
  - Sets headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.
  - Streams periodic JSON events (`data: {"status": ..., "progress": ..., "result": ..., "error": ...}\n\n`).
  - Closes connection when job reaches `completed` or `failed`.

## 2. 3D Virtual Studio Visibility Pause (`app/virtual-studio.tsx`)
- **Visibility Event**: `document.addEventListener("visibilitychange", ...)`
- **Render Loop Control**: If `document.hidden` is true, cancel current `requestAnimationFrame` or pause animation execution. When `document.hidden` becomes false, resume `requestAnimationFrame` loop.
