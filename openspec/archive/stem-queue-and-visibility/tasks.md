# Tasks: Stem Queue SSE & Virtual Studio Visibility Pause

- [x] 1. Create OpenSpec proposal, design, and tasks files under `openspec/changes/stem-queue-and-visibility/`.
- [x] 2. Update `backend/services/queue.ts` to support `queued`, `processing`, `completed`, `failed` statuses and `progress` (0-100), updating progress during job execution.
- [x] 3. Add SSE progress endpoint in `backend/routes/extract.ts` (`GET /api/extract/progress/:jobId`).
- [x] 4. Update `app/virtual-studio.tsx` to add `visibilitychange` listener pausing/resuming Three.js `requestAnimationFrame` loop.
- [x] 5. Create/update `tests/futureRoadmap.test.ts` with unit tests for the queue, SSE endpoint/status check, and visibility management.
- [x] 6. Run verification checks (`npx tsc --noEmit`, backend build, vitest).
- [x] 7. Commit changes and push.
