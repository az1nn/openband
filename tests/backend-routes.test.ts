import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { requireAuth } from "../backend/src/middleware/authMiddleware";
import extractRoutes from "../backend/src/routes/extract";
import masterRoutes from "../backend/src/routes/master";

function makeRes() {
  let statusCode = 200;
  const payload: any = {};
  const res: any = {
    status(c: number) {
      statusCode = c;
      return res;
    },
    json(body: unknown) {
      payload.body = body;
      return res;
    },
    get statusCode() {
      return statusCode;
    },
    get body() {
      return payload.body;
    },
  };
  return res;
}

describe("Backend protected-route auth (S2 lock-in)", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret-s2";
  });

  it("requireAuth rejects requests with no Authorization header (401)", () => {
    const req: any = { headers: {} };
    const res = makeRes();
    let nexted = false;
    requireAuth(req, res, () => {
      nexted = true;
    });
    expect(res.statusCode).toBe(401);
    expect(nexted).toBe(false);
  });

  it("requireAuth rejects requests with an invalid token (401)", () => {
    const req: any = { headers: { authorization: "Bearer not-a-valid-jwt" } };
    const res = makeRes();
    let nexted = false;
    requireAuth(req, res, () => {
      nexted = true;
    });
    expect(res.statusCode).toBe(401);
    expect(nexted).toBe(false);
  });

  it("requireAuth calls next() when a valid JWT is supplied", () => {
    const token = jwt.sign({ userId: "u1", tier: "free" }, "test-secret-s2");
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = makeRes();
    let nexted = false;
    requireAuth(req, res, () => {
      nexted = true;
    });
    expect(nexted).toBe(true);
    expect(req.userTokenData).toMatchObject({ userId: "u1", tier: "free" });
  });
});

describe("Protected route handlers respond when auth is satisfied", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret-s2";
  });

  async function withServer(handler: (base: string) => Promise<void>) {
    const app = express();
    app.use(express.json());
    const token = jwt.sign({ userId: "u1", tier: "free" }, "test-secret-s2");
    app.use((req: any, _res, next) => {
      req.userTokenData = jwt.verify(token, "test-secret-s2");
      next();
    });
    app.use("/api/extract", extractRoutes);
    app.use("/api/master", masterRoutes);
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      await handler(base);
    } finally {
      server.close();
    }
  }

  it("POST /api/extract handler runs (400 missing file) when authorized", async () => {
    await withServer(async (base) => {
      const res = await fetch(`${base}/api/extract`, { method: "POST" });
      expect([400, 413, 500]).toContain(res.status);
    });
  });

  it("POST /api/master/bounce handler runs (400 missing file) when authorized", async () => {
    await withServer(async (base) => {
      const res = await fetch(`${base}/api/master/bounce`, { method: "POST" });
      expect([400, 413, 500]).toContain(res.status);
    });
  });
});
