// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { requireAuth, requireAuthQuery } from "../backend/src/middleware/authMiddleware";
import storageRouter from "../backend/src/routes/storage";
import extractRouter from "../backend/src/routes/extract";
import masterRouter from "../backend/src/routes/master";

const JWT_SECRET = "test-secret-round2";

function makeRes() {
  const res: any = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(c: number) {
      this.statusCode = c;
      return this;
    },
    json(b: unknown) {
      this.body = b;
      return this;
    },
    setHeader(k: string, v: unknown) {
      this.headers[k] = v;
      return this;
    },
    send(b: unknown) {
      this.body = b;
      return this;
    },
    sendFile(_p: string, cb?: any) {
      if (cb) cb(null);
      return this;
    },
  };
  return res;
}

function findHandler(router: any, path: string) {
  for (const layer of router.stack) {
    const route = layer.route;
    if (!route || route.path !== path) continue;
    const handlers = route.stack;
    return handlers[handlers.length - 1].handle;
  }
  throw new Error(`No route registered for ${path}`);
}

beforeEach(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

describe("Auth middleware (regression)", () => {
  it("requireAuth rejects requests with no Authorization header (401, next not called)", () => {
    const req: any = { headers: {} };
    const res = makeRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAuthQuery accepts a valid token via query string (next called)", () => {
    const token = jwt.sign({ userId: "u1", tier: "free" }, JWT_SECRET);
    const req: any = { headers: {}, query: { token } };
    const res = makeRes();
    const next = vi.fn();
    requireAuthQuery(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.userTokenData).toMatchObject({ userId: "u1", tier: "free" });
  });

  it("requireAuthQuery rejects when no token is present anywhere (401)", () => {
    const req: any = { headers: {}, query: {} };
    const res = makeRes();
    const next = vi.fn();
    requireAuthQuery(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("Storage ownership scoping (regression)", () => {
  it("presign-download rejects a key outside the caller's userId prefix (403)", async () => {
    const handler = findHandler(storageRouter, "/storage/presign-download");
    const req: any = {
      userTokenData: { userId: "userA" },
      query: { key: "userB/secrets.wav" },
    };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("presign-download accepts a key under the caller's userId prefix (200)", async () => {
    const handler = findHandler(storageRouter, "/storage/presign-download");
    const req: any = {
      userTokenData: { userId: "userA" },
      query: { key: "userA/ok.wav" },
    };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeTruthy();
  });

  it("head rejects a key outside the caller's userId prefix (403)", async () => {
    const handler = findHandler(storageRouter, "/storage/head");
    const req: any = {
      userTokenData: { userId: "userA" },
      query: { key: "userB/secrets.wav" },
    };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("head accepts a key under the caller's userId prefix (200)", async () => {
    const handler = findHandler(storageRouter, "/storage/head");
    const req: any = {
      userTokenData: { userId: "userA" },
      query: { key: "userA/ok.wav" },
    };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });
});

describe("Download ownership scoping (regression)", () => {
  it("GET /stems/:filename rejects a filename not prefixed with caller userId (403)", () => {
    const handler = findHandler(extractRouter, "/stems/:filename");
    const req: any = {
      userTokenData: { userId: "userA" },
      params: { filename: "userB__stem.wav" },
    };
    const res = makeRes();
    handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("GET /stems/:filename proceeds for a filename prefixed with caller userId (200)", () => {
    const handler = findHandler(extractRouter, "/stems/:filename");
    const req: any = {
      userTokenData: { userId: "userA" },
      params: { filename: "userA__stem.wav" },
    };
    const res = makeRes();
    handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("GET /master/download/:filename rejects a filename not prefixed with caller userId (403)", () => {
    const handler = findHandler(masterRouter, "/master/download/:filename");
    const req: any = {
      userTokenData: { userId: "userA" },
      params: { filename: "userB__stem.wav" },
    };
    const res = makeRes();
    handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("GET /master/download/:filename proceeds for a filename prefixed with caller userId (200)", () => {
    const handler = findHandler(masterRouter, "/master/download/:filename");
    const req: any = {
      userTokenData: { userId: "userA" },
      params: { filename: "master_userA_123.wav" },
    };
    const res = makeRes();
    handler(req, res);
    expect(res.statusCode).toBe(200);
  });
});
