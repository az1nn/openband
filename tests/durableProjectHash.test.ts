import { describe, it, expect } from "vitest";
import {
  setupProjectStarter,
  buildApprovedSnapshot,
} from "../src/lib/projectStarter";
import {
  musicalContentHash,
  persistenceIntegrityHash,
} from "../src/lib/creativeIdentity";
import { buildProjectData } from "../app/studio/parts";

function makeResult() {
  return setupProjectStarter({
    name: "Durable",
    genreId: "rock",
    mood: "dark",
    bpm: 120,
    numBars: 8,
    timeSignature: "4/4",
    key: "C",
  });
}

describe("durable project musicalContentHash (PR04 end-to-end)", () => {
  it("buildProjectData carries musicalContentHash equal to the approved snapshot", () => {
    const result = makeResult();
    const h = musicalContentHash(result);
    const snapshot = buildApprovedSnapshot(result);

    const project = buildProjectData({
      title: result.name,
      genre: result.genreId,
      key: result.key,
      mood: result.mood,
      metronome: {
        bpm: result.bpm,
        timeSig: [4, 4],
        accentInterval: 4,
        volume: 60,
        enabled: true,
        countIn: true,
        countInBars: 2,
      } as any,
      tracks: result.tracks,
      groups: [],
      buses: [],
      trackAssignments: {},
      masterPlugins: [],
      masteringChain: [],
      mixSnapshots: [],
      activeMixId: undefined,
      recordSettings: {} as any,
      sendBuses: [],
      trackAmpChains: {},
      musicalContentHash: h,
      persistenceIntegrityHash: persistenceIntegrityHash({
        projectId: "proj-x",
        musicalContentHash: h,
        approvalToken: "proj-x",
        sourceRecipe: {
          genreId: result.genreId,
          mood: result.mood,
          bpm: result.bpm,
          key: result.key,
          timeSignature: result.timeSignature,
          numBars: result.numBars,
        },
      }),
    });

    expect(project.musicalContentHash).toBe(h);
    expect(project.musicalContentHash).toBe(snapshot.approvedMusicalHash);
    expect(project.persistenceIntegrityHash).toBeDefined();
  });

  it("durable persistenceIntegrityHash is deterministic for identical inputs", () => {
    const result = makeResult();
    const h = musicalContentHash(result);
    const sourceRecipe = {
      genreId: result.genreId,
      mood: result.mood,
      bpm: result.bpm,
      key: result.key,
      timeSignature: result.timeSignature,
      numBars: result.numBars,
    };
    const a = persistenceIntegrityHash({
      projectId: "proj-x",
      musicalContentHash: h,
      approvalToken: "proj-x",
      sourceRecipe,
    });
    const b = persistenceIntegrityHash({
      projectId: "proj-x",
      musicalContentHash: h,
      approvalToken: "proj-x",
      sourceRecipe,
    });
    expect(a).toBe(b);
  });
});
