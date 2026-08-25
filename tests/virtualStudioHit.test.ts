import { describe, it, expect } from "vitest";
import { resolveFurnitureIdFromHit } from "../app/virtual-studio";

describe("resolveFurnitureIdFromHit (M14 hit-test)", () => {
  it("returns furnitureId from a direct mesh hit", () => {
    const hit = { userData: { furnitureId: "mixer" }, parent: null };
    expect(resolveFurnitureIdFromHit(hit as any)).toBe("mixer");
  });

  it("walks up to the parent group to find furnitureId (top/label hit)", () => {
    const group = { userData: { furnitureId: "mastering" }, parent: null };
    const top = { userData: {}, parent: group };
    const label = { userData: {}, parent: top };
    expect(resolveFurnitureIdFromHit(label as any)).toBe("mastering");
  });

  it("returns undefined when no furnitureId exists in the chain", () => {
    const obj = { userData: {}, parent: { userData: {}, parent: null } };
    expect(resolveFurnitureIdFromHit(obj as any)).toBeUndefined();
  });

  it("returns undefined for a null hit", () => {
    expect(resolveFurnitureIdFromHit(null)).toBeUndefined();
  });
});
