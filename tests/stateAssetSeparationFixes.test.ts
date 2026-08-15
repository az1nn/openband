import { describe, it, expect } from "vitest";
import {
  createProject,
  commitState,
  updateProjectState,
  revertToCommit,
  getProject,
} from "../src/lib/stateAssetSeparation";

describe("stateAssetSeparation revertToCommit (M15)", () => {
  it("revertToCommit restores the committed snapshot, not the mutated current project", async () => {
    await createProject(120, 44100, "Test Project");

    const committed = updateProjectState((s) => ({
      ...s,
      tracks: [
        {
          id: "t1",
          name: "Drums",
          type: "audio",
          muted: false,
          solo: false,
          volume: 80,
          pan: 0,
          outputBus: "bus-main",
          pluginChain: [],
          regions: [],
        },
      ],
    }));
    expect(committed).not.toBeNull();

    const commit = await commitState("initial mix", "local", "main");
    expect(commit).not.toBeNull();
    expect(commit?.snapshot).toBeDefined();

    const committedJson = JSON.stringify(committed);

    const mutated = updateProjectState((s) => ({
      ...s,
      tracks: [
        {
          id: "t2",
          name: "Synth",
          type: "midi",
          muted: false,
          solo: false,
          volume: 65,
          pan: 10,
          outputBus: "bus-main",
          pluginChain: [],
          midiNotes: [],
        },
      ],
    }));
    expect(mutated?.tracks[0].id).toBe("t2");

    const restored = revertToCommit(commit!.id);
    expect(restored).not.toBeNull();
    expect(JSON.stringify(restored)).toBe(committedJson);
    expect(getProject()?.tracks[0].id).toBe("t1");
    expect(getProject()?.tracks[0].name).toBe("Drums");
  });

  it("revertToCommit returns null for an unknown commit id", async () => {
    await createProject(90, 48000, "Empty");
    await commitState("snapshot", "local", "main");
    const restored = revertToCommit("does-not-exist");
    expect(restored).toBeNull();
  });
});
