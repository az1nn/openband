import { describe, it, expect } from "vitest";
import {
  createTelemetry,
  redactSecrets,
  type CreativeTelemetryEvent,
} from "../src/lib/telemetry.ts";

describe("CreativeTelemetryEvent", () => {
  it("every union member compiles", () => {
    const events: CreativeTelemetryEvent[] = [
      { type: "session_opened", genreId: "g1", ts: 1 },
      { type: "recipe_configured", genreId: "g1", ts: 2 },
      { type: "locks_changed", lockedRoles: ["rhythm"], ts: 3 },
      { type: "variation_generated", variationId: "v1", musicalHash: "h1", ts: 4 },
      { type: "variation_selected", variationId: "v1", ts: 5 },
      { type: "preview_started", cacheKey: "c1", ts: 6 },
      { type: "preview_ended", cacheKey: "c1", reason: "natural", ts: 7 },
      { type: "preview_rejected", reason: "busy", ts: 8 },
      { type: "promotion_succeeded", projectId: "p1", ts: 9 },
      { type: "promotion_failed", reason: "x", ts: 10 },
    ];
    for (const e of events) {
      expect(typeof e.type).toBe("string");
    }
  });
});

describe("redactSecrets", () => {
  it("removes approvalToken/uri/secret/audioUri/path keys recursively", () => {
    const input = {
      approvalToken: "t1",
      token: "t2",
      secret: "s1",
      uri: "u1",
      audioUri: "au1",
      path: "p1",
      filePath: "fp1",
      blob: "b1",
      apiKey: "ak1",
      access_token: "at1",
      keep: "ok",
      audioType: "wav",
      nested: {
        secret: "s2",
        token: "t3",
        okay: "fine",
        deep: { password: "pw", safe: 1 },
      },
      list: [{ token: "t4", ok: true }],
    };
    const out = redactSecrets(input);
    expect((out as { approvalToken?: string }).approvalToken).toBeUndefined();
    expect((out as { token?: string }).token).toBeUndefined();
    expect((out as { secret?: string }).secret).toBeUndefined();
    expect((out as { uri?: string }).uri).toBeUndefined();
    expect((out as { audioUri?: string }).audioUri).toBeUndefined();
    expect((out as { path?: string }).path).toBeUndefined();
    expect((out as { filePath?: string }).filePath).toBeUndefined();
    expect((out as { blob?: string }).blob).toBeUndefined();
    expect((out as { apiKey?: string }).apiKey).toBeUndefined();
    expect((out as { access_token?: string }).access_token).toBeUndefined();
    expect((out as { keep?: string }).keep).toBe("ok");
    expect((out as { audioType?: string }).audioType).toBe("wav");
    expect((out.nested as { secret?: string }).secret).toBeUndefined();
    expect((out.nested as { token?: string }).token).toBeUndefined();
    expect((out.nested as { okay?: string }).okay).toBe("fine");
    expect((out.nested.deep as { password?: string }).password).toBeUndefined();
    expect((out.nested.deep as { safe?: number }).safe).toBe(1);
    expect((out.list[0] as { token?: string }).token).toBeUndefined();
    expect((out.list[0] as { ok?: boolean }).ok).toBe(true);
  });

  it("returns a deep clone", () => {
    const input = { a: { b: 1 } };
    const out = redactSecrets(input);
    expect(out).not.toBe(input);
    expect(out.a).not.toBe(input.a);
  });
});

describe("createTelemetry", () => {
  it("calls reporter with the redacted event and clones nested secrets", () => {
    const received: CreativeTelemetryEvent[] = [];
    const { track } = createTelemetry((e) => received.push(e));
    const base = {
      type: "variation_selected",
      variationId: "v1",
      ts: 5,
      secret: "should-go",
      nested: { token: "t", fine: "x" },
    } as unknown as CreativeTelemetryEvent;
    track(base);
    expect(received.length).toBe(1);
    const saved = received[0] as Record<string, unknown>;
    expect(saved.secret).toBeUndefined();
    expect(((saved.nested as Record<string, unknown>).token as string | undefined) === undefined).toBe(true);
    expect((saved.nested as Record<string, unknown>).fine).toBe("x");
  });

  it("ignores unknown event types", () => {
    const received: unknown[] = [];
    const { track } = createTelemetry((e) => received.push(e));
    track({ type: "bogus" } as unknown as CreativeTelemetryEvent);
    expect(received.length).toBe(0);
  });
});
