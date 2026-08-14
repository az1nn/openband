# Proposal: Stem Separation Queue & SSE Progress + 3D Virtual Studio Visibility Pause

## Context & Problem
1. **Stem Separation Queue & Progress**: Asynchronous audio stem separation jobs currently lack explicit status tracking (`queued`, `processing`, `completed`, `failed`), real-time progress percentages (0-100), and a Server-Sent Events (SSE) streaming endpoint (`GET /api/extract/progress/:jobId`) for client progress monitoring.
2. **3D Virtual Studio Performance**: The 3D Virtual Studio (`app/virtual-studio.tsx`) continuously runs its `requestAnimationFrame` loop even when the browser tab is hidden or backgrounded, consuming unnecessary CPU and GPU resources.

## High-Level Objectives
1. Enhance `backend/services/queue.ts` and `backend/routes/extract.ts` to manage job statuses (`queued`, `processing`, `completed`, `failed`), compute progress percentage (0-100), and expose SSE progress updates.
2. Add `visibilitychange` event listener in `app/virtual-studio.tsx` to pause and resume the Three.js render loop.
3. Add robust unit tests in `tests/futureRoadmap.test.ts`.
