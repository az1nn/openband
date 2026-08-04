import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  saveProject,
  loadProject,
  createRemix,
  type ProjectData,
} from "../src/lib/projectStore";
import { ProjectCard } from "../src/components/ProjectCard";

const COVER_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA==";

function makeProjectData(
  overrides: Partial<Omit<ProjectData, "id" | "lastSaved">> = {},
): Omit<ProjectData, "id" | "lastSaved"> {
  return {
    title: "Projeto",
    genre: "rock",
    key: "C",
    bpm: 120,
    tracks: [],
    groups: [],
    buses: [],
    trackAssignments: {},
    masterPlugins: [],
    masteringChain: [],
    sendBuses: [],
    trackAmpChains: {},
    mixSnapshots: [],
    activeMixId: undefined,
    metronome: {
      bpm: 120,
      timeSig: [4, 4],
      accentInterval: 4,
      volume: 0.5,
      enabled: false,
      countIn: false,
      countInBars: 2,
    },
    recordSettings: {
      armed: false,
      inputSource: "mic",
      quality: "high",
      sampleRate: 44100,
      mono: false,
      preRoll: 0,
    },
    ...overrides,
  };
}

describe("projectStore cover/lyrics", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("persists coverUrl and lyrics through save/load round-trip", () => {
    const ok = saveProject(
      "proj-1",
      makeProjectData({ coverUrl: COVER_URL, lyrics: "Letra da música" }),
    );
    expect(ok).toBe(true);
    const loaded = loadProject("proj-1");
    expect(loaded?.coverUrl).toBe(COVER_URL);
    expect(loaded?.lyrics).toBe("Letra da música");
  });

  it("sanitizeProjectData ignores non-string coverUrl/lyrics", () => {
    localStorage.setItem(
      "openband_project_proj-raw",
      JSON.stringify({
        id: "proj-raw",
        title: "Raw",
        bpm: 120,
        coverUrl: 12345,
        lyrics: { not: "a string" },
      }),
    );
    const loaded = loadProject("proj-raw");
    expect(loaded?.coverUrl).toBeUndefined();
    expect(loaded?.lyrics).toBeUndefined();
  });

  it("saveProject returns false on quota error instead of failing silently", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    const ok = saveProject("proj-q", makeProjectData());
    expect(ok).toBe(false);
    expect(loadProject("proj-q")).toBeNull();
  });

  it("createRemix drops coverUrl so base64 is not duplicated", () => {
    saveProject("proj-orig", makeProjectData({ coverUrl: COVER_URL }));
    const newId = createRemix("proj-orig", "user-1");
    expect(newId).toBeTruthy();
    const remix = loadProject(newId as string);
    expect(remix?.title).toBe("Remix: Projeto");
    expect(remix?.coverUrl).toBeUndefined();
  });
});

describe("ProjectCard cover rendering", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const base = {
    id: "p1",
    title: "Minha Música",
    lastSaved: Date.now(),
    isFavorite: false,
    onToggleFavorite: vi.fn(),
    onOpen: vi.fn(),
    onRefresh: vi.fn(),
  };

  it("renders an Image when coverUrl starts with data:image/", () => {
    render(
      <ProjectCard
        {...base}
        project={{ ...base, metadata: { coverUrl: COVER_URL } as ProjectData }}
      />,
    );
    expect(screen.getByLabelText("Capa do projeto")).toBeTruthy();
    expect(screen.queryByText("♫")).toBeNull();
  });

  it("keeps the ♫ placeholder when coverUrl is missing or not a data URL", () => {
    render(
      <ProjectCard
        {...base}
        project={{ ...base, metadata: null }}
      />,
    );
    expect(screen.getByText("♫")).toBeTruthy();
    expect(screen.queryByLabelText("Capa do projeto")).toBeNull();
  });

  it("keeps the ♫ placeholder for non-data cover URLs", () => {
    render(
      <ProjectCard
        {...base}
        project={{
          ...base,
          metadata: { coverUrl: "https://example.com/cover.png" } as ProjectData,
        }}
      />,
    );
    expect(screen.getByText("♫")).toBeTruthy();
    expect(screen.queryByLabelText("Capa do projeto")).toBeNull();
  });
});
