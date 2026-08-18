import { Router, Response } from "express";
import { addJob, getJobStatus } from "../services/queue";
import { requireAuth, type AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

router.post("/stems/separate", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { url } = req.body ?? {};
  if (!url) {
    return res.status(400).json({ error: "Audio asset reference required" });
  }
  const jobId = addJob("stem_separation", { url });
  res.status(202).json({ jobId, status: "pending" });
});

router.get("/stems/status/:id", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const job = getJobStatus(id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.json({ jobId: id, ...job });
});

export default router;
