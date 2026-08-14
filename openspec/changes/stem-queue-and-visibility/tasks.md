# Tasks: Stem Queue SSE & Virtual Studio Visibility Pause

- [ ] 1. Create OpenSpec proposal, design, and tasks files under `openspec/changes/stem-queue-and-visibility/`.
- [ ] 2. Update `backend/services/queue.ts` to support `queued`, `processing`, `completed`, `failed` statuses and `progress` (0-100), updating progress during job execution.
- [ ] 3. Add SSE progress endpoint in `backend/routes/extract.ts` (`GET /api/extract/progress/:jobId`).
- [ ] 4. Update `app/virtual-studio.tsx` to add `visibilitychange` listener pausing/resuming Three.js `requestAnimationFrame` loop.
- [ ] 5. Create/update `tests/futureRoadmap.test.ts` with unit tests for the queue, SSE endpoint/status check, and visibility management.
- [ ] 6. Run verification checks (`npx tsc --noEmit`, backend build, vitest).
- [ ] 7. Commit changes and push.
