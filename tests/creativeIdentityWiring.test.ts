import { describe, it, expect } from "vitest";
import {
  setupProjectStarter,
  buildApprovedSnapshot,
} from "../src/lib/projectStarter";
import {
  musicalContentHash,
  recipeFingerprint,
  persistenceIntegrityHash,
} from "../src/lib/creativeIdentity";

function makeResult() {
  return setupProjectStarter({
    name: "Wired",
    genreId: "rock",
    mood: "dark",
    bpm: 120,
    numBars: 8,
    timeSignature: "4/4",
    key: "C",
  });
}

describe("creativeIdentity wiring (PR04)", () => {
  it("buildApprovedSnapshot populates the separated identity hashes", () => {
    const result = makeResult();
    const snap = buildApprovedSnapshot(result);

    const expectedMusical = musicalContentHash(result);
    const expectedFp = recipeFingerprint({
      genreId: result.genreId,
      mood: result.mood,
      bpm: result.bpm,
      key: result.key,
      timeSignature: result.timeSignature,
      numBars: result.numBars,
    });

    expect(snap.approvedMusicalHash).toBe(expectedMusical);
    expect(snap.recipeFingerprint).toBe(expectedFp);
    expect(snap.persistenceIntegrityHash).toBeDefined();
  });

  it("PR04 promoted musical hash equals approved musical hash (by construction)", () => {
    const result = makeResult();
    const snap = buildApprovedSnapshot(result);
    expect(snap.approvedMusicalHash).toBe(musicalContentHash(result));
    const recomputed = persistenceIntegrityHash({
      projectId: result.id,
      musicalContentHash: snap.approvedMusicalHash!,
      approvalToken: snap.approvalToken,
      sourceRecipe: {
        genreId: result.genreId,
        mood: result.mood,
        bpm: result.bpm,
        key: result.key,
        timeSignature: result.timeSignature,
        numBars: result.numBars,
      },
    });
    expect(snap.persistenceIntegrityHash).toBe(recomputed);
  });
});
