import { describe, it, expect } from "vitest";
import extractRoutes from "../backend/src/routes/extract";

function collectRoutes(router: any): Array<{ method: string; path: string }> {
  const out: Array<{ method: string; path: string }> = [];
  for (const layer of router.stack) {
    const route = (layer as any).route;
    if (!route) continue;
    const methods = Object.keys(route.methods).map((m) => m.toUpperCase());
    out.push({ method: methods.join("|"), path: route.path });
  }
  return out;
}

describe("extract route H4 dead progress endpoint removed", () => {
  it("no longer registers GET /extract/progress/:jobId", () => {
    const routes = collectRoutes(extractRoutes);
    const progress = routes.find(
      (r) => r.method.includes("GET") && r.path.includes("/extract/progress"),
    );
    expect(progress).toBeUndefined();
  });

  it("still exposes POST /extract", () => {
    const routes = collectRoutes(extractRoutes);
    const post = routes.find(
      (r) => r.method.includes("POST") && r.path === "/extract",
    );
    expect(post).toBeDefined();
  });
});
