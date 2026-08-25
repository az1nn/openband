import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import collabRoutes from "../backend/src/routes/collab";
import presenceRoutes from "../backend/src/routes/presence";

function getHandler(router: any, method: string, pathIncludes: string): any {
  for (const layer of router.stack) {
    const route = layer.route;
    if (!route) continue;
    if (!route.methods[method.toLowerCase()]) continue;
    if (route.path.includes(pathIncludes)) {
      return route.stack[route.stack.length - 1].handle;
    }
  }
  return undefined;
}

function makeRes() {
  const writes: string[] = [];
  const res: any = {
    statusCode: 200,
    write(chunk: string) {
      writes.push(chunk);
      return true;
    },
    writeHead() {
      return res;
    },
    status(c: number) {
      res.statusCode = c;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    end() {},
    on() {},
    headersSent: false,
  };
  res.body = undefined;
  return { res, writes };
}

describe("collab SSE auth (M11/M12)", () => {
  beforeEach(() => {
    vi.stubGlobal("setInterval", () => 1);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("subscribe uses token userId, not query userId", () => {
    const handler = getHandler(collabRoutes, "get", "/subscribe");
    const { res, writes } = makeRes();
    const req: any = {
      params: { projectId: "p1" },
      query: { userId: "evil", userName: "Evil" },
      userTokenData: { userId: "real-user", tier: "free" },
      headers: {},
      on() {},
    };
    handler(req, res, () => {});
    expect(writes[0]).toContain('"userId":"real-user"');
    expect(writes[0]).not.toContain("evil");
  });

  it("POST operation uses token userId, never the spoofed body userId", () => {
    const subHandler = getHandler(collabRoutes, "get", "/subscribe");
    const { res: obsRes, writes: obsWrites } = makeRes();
    const obsReq: any = {
      params: { projectId: "p2" },
      query: {},
      userTokenData: { userId: "observer", tier: "free" },
      headers: {},
      on() {},
    };
    subHandler(obsReq, obsRes, () => {});

    const opHandler = getHandler(collabRoutes, "post", "/operation");
    const { res: opRes } = makeRes();
    const opReq: any = {
      params: { projectId: "p2" },
      body: {
        operation: {
          id: "op1",
          userId: "evil",
          timestamp: 1,
          type: "track.add",
          path: "tracks",
          value: { id: "t1" },
          clientId: "c1",
        },
      },
      userTokenData: { userId: "real-user", tier: "free" },
      headers: {},
      on() {},
    };
    opHandler(opReq, opRes, () => {});
    expect(opRes.statusCode).not.toBe(401);
    expect(opRes.body).toEqual({ ok: true });

    const broadcast = obsWrites.find((w) => w.includes('"type":"operations"'));
    expect(broadcast).toBeDefined();
    expect(broadcast).toContain('"userId":"real-user"');
    expect(broadcast).not.toContain('"userId":"evil"');
  });

  it("clears the keepAlive timer on client disconnect (M11)", () => {
    const clearSpy = vi.spyOn(global, "clearInterval");
    const handler = getHandler(collabRoutes, "get", "/subscribe");
    const { res } = makeRes();
    let closeCb: any;
    const req: any = {
      params: { projectId: "p3" },
      query: {},
      userTokenData: { userId: "u3", tier: "free" },
      headers: {},
      on(event: string, cb: any) {
        if (event === "close") closeCb = cb;
      },
    };
    handler(req, res, () => {});
    expect(typeof closeCb).toBe("function");
    closeCb();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});

describe("presence SSE auth (M11/M12)", () => {
  beforeEach(() => {
    vi.stubGlobal("setInterval", () => 1);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("subscribe uses token userId, not query userId", () => {
    const handler = getHandler(presenceRoutes, "get", "/subscribe");
    const { res, writes } = makeRes();
    const req: any = {
      params: { projectId: "pp1" },
      query: { userId: "evil" },
      userTokenData: { userId: "real-user", tier: "free" },
      headers: {},
      on() {},
    };
    handler(req, res, () => {});
    expect(writes[0]).toContain('"userId":"real-user"');
    expect(writes[0]).not.toContain("evil");
  });

  it("POST cursor uses token userId, not body userId", () => {
    const subHandler = getHandler(presenceRoutes, "get", "/subscribe");
    const { res: obsRes, writes: obsWrites } = makeRes();
    const obsReq: any = {
      params: { projectId: "pp2" },
      query: {},
      userTokenData: { userId: "observer", tier: "free" },
      headers: {},
      on() {},
    };
    subHandler(obsReq, obsRes, () => {});

    const curHandler = getHandler(presenceRoutes, "post", "/cursor");
    const { res: curRes } = makeRes();
    const curReq: any = {
      params: { projectId: "pp2" },
      body: { userId: "evil", cursorX: 5, activeTrackId: null, playheadPosition: 1 },
      userTokenData: { userId: "real-user", tier: "free" },
      headers: {},
      on() {},
    };
    curHandler(curReq, curRes, () => {});
    expect(curRes.statusCode).not.toBe(401);

    const broadcast = obsWrites.find((w) => w.includes('"cursorX"'));
    expect(broadcast).toBeDefined();
    expect(broadcast).toContain('"userId":"real-user"');
    expect(broadcast).not.toContain('"userId":"evil"');
  });

  it("POST leave uses token userId, not body userId", () => {
    const handler = getHandler(presenceRoutes, "post", "/leave");
    const { res } = makeRes();
    const req: any = {
      params: { projectId: "pp3" },
      body: { userId: "evil" },
      userTokenData: { userId: "real-user", tier: "free" },
      headers: {},
      on() {},
    };
    handler(req, res, () => {});
    expect(res.statusCode).not.toBe(401);
    expect(res.body).toEqual({ ok: true });
  });
});
