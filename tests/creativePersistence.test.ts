import { describe, it, expect } from "vitest";
import {
  createEphemeralSessionStore,
  redactForDurable,
  recursiveSecretRedaction,
  scopeIsEphemeral,
  CREATIVE_SESSION_SCOPE,
  type PersistenceScope,
} from "../src/lib/creativePersistence.ts";
import { setupProjectStarter } from "../src/lib/projectStarter";
import type { CreativeVariation } from "../src/lib/creativeSession";

describe("ephemeral session store", () => {
  it("set/get/remove/clear", () => {
    const store = createEphemeralSessionStore<number>();
    expect(store.size()).toBe(0);
    store.set("a", 1);
    store.set("b", 2);
    expect(store.size()).toBe(2);
    expect(store.get("a")).toBe(1);
    store.remove("a");
    expect(store.get("a")).toBeUndefined();
    expect(store.size()).toBe(1);
    store.clear();
    expect(store.size()).toBe(0);
    expect(store.get("b")).toBeUndefined();
  });
});

describe("redactForDurable", () => {
  it("removes the preview field", () => {
    const result = setupProjectStarter({ name: "n", genreId: "rock", bpm: 120, numBars: 8, timeSignature: "4/4", key: "C" });
    const variation: CreativeVariation = {
      variationId: "v1",
      recipeFingerprint: "r1",
      musicalContentHash: "m1",
      baseVariationId: "b1",
      variationSeed: "seed1",
      generatorVersion: "1.0.0",
      effectiveLocks: { rhythm: true },
      result,
      preview: { cacheKey: "c1", budgetBars: 4 },
    };
    const out = redactForDurable(variation);
    expect((out as { preview?: unknown }).preview).toBeUndefined();
    expect(out.variationId).toBe("v1");
    expect(out.result).toBe(variation.result);
    expect(variation.preview?.cacheKey).toBe("c1");
  });
});

describe("recursiveSecretRedaction", () => {
  it("strips secret keys", () => {
    const input = { token: "t", nested: { secret: "s", ok: 1 }, list: [{ password: "p" }] };
    const out = recursiveSecretRedaction(input);
    expect((out as { token?: string }).token).toBeUndefined();
    expect((out.nested as { secret?: string }).secret).toBeUndefined();
    expect((out.nested as { ok?: number }).ok).toBe(1);
    expect((out.list[0] as { password?: string }).password).toBeUndefined();
  });
});

describe("scopeIsEphemeral", () => {
  it("is true for creative-session", () => {
    expect(scopeIsEphemeral(CREATIVE_SESSION_SCOPE)).toBe(true);
    expect(scopeIsEphemeral("creative-session" as PersistenceScope)).toBe(true);
    expect(scopeIsEphemeral("project")).toBe(false);
  });
});
