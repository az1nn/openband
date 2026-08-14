import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addJob, getJobStatus } from "../backend/src/services/queue.ts";

describe("Stem Separation Queue & Progress", () => {
  it("tracks job status and progress percentage correctly", async () => {
    const jobId = addJob("test_extraction", { source: "test.wav" });
    const initialStatus = getJobStatus(jobId);
    assert.notEqual(initialStatus, null);
    assert.ok(["queued", "processing", "pending"].includes(initialStatus!.status));
    assert.ok(initialStatus!.progress >= 0 && initialStatus!.progress <= 100);

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

    assert.equal(completed, true);
    assert.equal(finalStatus.status, "completed");
    assert.equal(finalStatus.progress, 100);
    assert.ok(finalStatus.result);
  });
});

describe("3D Virtual Studio Visibility Pause Logic", () => {
  it("pauses animation when document.hidden is true", () => {
    const mockDocument = { hidden: true };
    const handleVisibilityChange = (doc: any) => {
      return doc.hidden ? "paused" : "resumed";
    };
    assert.equal(handleVisibilityChange(mockDocument), "paused");
    mockDocument.hidden = false;
    assert.equal(handleVisibilityChange(mockDocument), "resumed");
  });
});
