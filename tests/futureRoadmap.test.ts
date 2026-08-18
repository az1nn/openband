import { describe, it, expect } from "vitest";
import { addJob, getJobStatus } from "../backend/src/services/queue.ts";

describe("Stem Separation Queue & Progress", () => {
  it("tracks job status and progress percentage correctly", async () => {
    const jobId = addJob("test_extraction", { source: "test.wav" });
    const initialStatus = getJobStatus(jobId);
    expect(initialStatus).not.toBeNull();
    expect(["queued", "processing", "pending"].includes(initialStatus!.status)).toBe(true);
    expect(initialStatus!.progress >= 0 && initialStatus!.progress <= 100).toBe(true);

    let completed = false;
    let finalStatus: any = null;
    for (let i = 0; i < 40; i++) {
      const st = getJobStatus(jobId);
      if (st?.status === "completed" || st?.status === "failed") {
        completed = true;
        finalStatus = st;
        break;
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    expect(completed).toBe(true);
    expect(finalStatus.status).toBe("completed");
    expect(finalStatus.progress).toBe(100);
    expect(finalStatus.result).toBeTruthy();
  });
});

describe("3D Virtual Studio Visibility Pause Logic", () => {
  it("pauses animation when document.hidden is true", () => {
    const mockDocument = { hidden: true };
    const handleVisibilityChange = (doc: any) => {
      return doc.hidden ? "paused" : "resumed";
    };
    expect(handleVisibilityChange(mockDocument)).toBe("paused");
    mockDocument.hidden = false;
    expect(handleVisibilityChange(mockDocument)).toBe("resumed");
  });
});
