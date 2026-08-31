import { describe, it, expect } from "vitest";
import { PreviewPlayback } from "../src/lib/previewLifecycle";

describe("PreviewLifecycle", () => {
  it("  ✔ first play accepted", () => {
    const pb = new PreviewPlayback();
    const r = pb.play();
    expect(r.accepted).toBe(true);
    expect(pb.status).toBe("playing");
    expect(pb.currentToken).not.toBeNull();
  });

  it("  ✔ second play while playing rejected reason busy and ownership unchanged", () => {
    const pb = new PreviewPlayback();
    pb.play();
    const token = pb.currentToken;
    const second = pb.play();
    expect(second.accepted).toBe(false);
    expect(second.reason).toBe("busy");
    expect(pb.status).toBe("playing");
    expect(pb.currentToken).toBe(token);
  });

  it("  ✔ end releases ownership", () => {
    const pb = new PreviewPlayback();
    pb.play();
    pb.end();
    expect(pb.status).toBe("stopped");
    expect(pb.currentToken).toBeNull();
  });

  it("  ✔ stop releases ownership", () => {
    const pb = new PreviewPlayback();
    pb.play();
    pb.stop();
    expect(pb.status).toBe("stopped");
    expect(pb.currentToken).toBeNull();
  });
});
