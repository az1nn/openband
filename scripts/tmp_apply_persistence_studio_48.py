from pathlib import Path
import re


def sub_once(path: str, pattern: str, replacement: str, label: str) -> None:
    p = Path(path)
    text = p.read_text()
    new, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"{label} replacement count={count}")
    p.write_text(new)


# Studio save UX: never display success when projectStore reports failure.
sub_once(
    "app/studio/hooks.ts",
    r'''\s*const handleManualSave = useCallback\(\(\) => \{\s*save\(\);\s*flashLabel\(t\("studio\.savedToast", "Saved ✓"\)\);\s*\}, \[save, flashLabel, t\]\);''',
    '''

  const reportSaveResult = useCallback(
    (saved: boolean, successLabel: string) => {
      flashLabel(saved ? successLabel : t("studio.saveFailed", "Save failed"));
    },
    [flashLabel, t],
  );

  const handleManualSave = useCallback(() => {
    reportSaveResult(save(), t("studio.savedToast", "Saved ✓"));
  }, [save, reportSaveResult, t]);''',
    "manual save",
)

sub_once(
    "app/studio/hooks.ts",
    r'''\s*// Debounced autosave whenever the snapshot content changes\.\s*useEffect\(\(\) => \{\s*const timer = setTimeout\(\(\) => \{\s*save\(\);\s*flashLabel\(t\("studio\.saved", "Saved"\)\);\s*\}, 2000\);\s*return \(\) => clearTimeout\(timer\);\s*\}, \[snapshot, id, save, flashLabel, t\]\);''',
    '''

  // Debounced autosave whenever the snapshot content changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      reportSaveResult(save(), t("studio.saved", "Saved"));
    }, 2000);
    return () => clearTimeout(timer);
  }, [snapshot, id, save, reportSaveResult, t]);

  // Flush the latest synchronous project state when a Web page is leaving.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const flushLatestSnapshot = () => {
      save();
    };
    window.addEventListener("pagehide", flushLatestSnapshot);
    return () => window.removeEventListener("pagehide", flushLatestSnapshot);
  }, [save]);''',
    "autosave",
)

# Pure Studio helpers keep durable-write ordering and missing-asset detection testable.
Path("app/studio/persistenceTrust.ts").write_text(r'''import type { TrackDef } from "../../src/lib/types";

export interface ImportableAudioFile extends Blob {
  name: string;
}

export async function persistImportedAudioFiles(params: {
  files: readonly ImportableAudioFile[];
  existingTrackCount: number;
  trackColors: readonly string[];
  persistAsset: (blob: Blob) => Promise<string>;
}): Promise<{ tracks: TrackDef[]; failedNames: string[] }> {
  const { files, existingTrackCount, trackColors, persistAsset } = params;
  const tracks: TrackDef[] = [];
  const failedNames: string[] = [];
  const batchId = Date.now();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const url = await persistAsset(file);
      const approxDuration = Math.max(10, Math.round(file.size / 30000));
      tracks.push({
        id: `import-${batchId}-${i}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        color: trackColors[(existingTrackCount + i) % trackColors.length] ?? "#888888",
        muted: false,
        solo: false,
        volume: 75,
        pan: 0,
        sends: {},
        sidechainSource: null,
        regions: [
          {
            id: `region-import-${batchId}-${i}`,
            start: i * 4,
            duration: Math.min(approxDuration, 300),
            url,
          },
        ],
        plugins: [],
        automation: {},
      });
    } catch {
      failedNames.push(file.name);
    }
  }

  return { tracks, failedNames };
}

export async function resolvePersistedTrackAssets(
  tracks: readonly TrackDef[],
  resolveAsset: (url: string) => Promise<string>,
): Promise<string[]> {
  const pointers = new Set<string>();
  for (const track of tracks) {
    for (const region of track.regions) {
      if (region.url?.startsWith("asset://")) pointers.add(region.url);
    }
  }

  const missing: string[] = [];
  await Promise.all(
    [...pointers].map(async (pointer) => {
      try {
        await resolveAsset(pointer);
      } catch {
        missing.push(pointer);
      }
    }),
  );
  return missing.sort();
}
''')

studio = Path("app/studio/[id].tsx")
s = studio.read_text()
anchor = 'import { getPlayheadBeat, setPlayheadBeat, subscribePlayhead } from "../../src/lib/playheadStore";'
helper_import = 'import { persistImportedAudioFiles, resolvePersistedTrackAssets } from "./persistenceTrust";\n'
if helper_import.strip() not in s:
    if anchor not in s:
        raise SystemExit("Studio import anchor not found")
    s = s.replace(anchor, helper_import + anchor, 1)

hydration_pattern = re.compile(
    r'''\s*useEffect\(\(\) => \{\s*for \(const t of tracks\) \{\s*for \(const r of t\.regions\) \{\s*if \(r\.url && r\.url\.startsWith\("asset://"\)\) \{\s*resolveAssetUrl\(r\.url\)\.catch\(\(e\) => console\.warn\("resolve asset url failed", e\)\);\s*\}\s*\}\s*\}\s*\}, \[tracks\]\);''',
    re.S,
)
hydration_replacement = '''

  const reportedMissingAssetsRef = useRef(new Set<string>());
  useEffect(() => {
    let cancelled = false;
    void resolvePersistedTrackAssets(tracks, resolveAssetUrl).then((missing) => {
      if (cancelled) return;
      const fresh = missing.filter((pointer) => !reportedMissingAssetsRef.current.has(pointer));
      if (fresh.length === 0) return;
      fresh.forEach((pointer) => reportedMissingAssetsRef.current.add(pointer));
      Alert.alert(
        t("studio.assetMissingTitle", "Audio unavailable"),
        t(
          "studio.assetMissingMessage",
          "Some local audio could not be restored. The project structure was kept intact.",
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [tracks, t]);'''
s, hydration_count = hydration_pattern.subn(hydration_replacement, s, count=1)
if hydration_count != 1:
    raise SystemExit(f"hydration replacement count={hydration_count}")

import_pattern = re.compile(
    r'''\s*const handleImportAudio = useCallback\(\(\) => \{.*?\n\s*\}, \[tracks, setTracks\]\);''',
    re.S,
)
import_replacement = '''

  const handleImportAudio = useCallback(() => {
    if (Platform.OS !== "web") {
      Alert.alert(
        t("studio.importTitle", "Import"),
        t("studio.importWebOnly", "Importing is only available in the web version."),
      );
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".wav,.mp3,.aiff,.flac,.ogg,.m4a,audio/*";
    input.multiple = true;
    input.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      const { tracks: importedTracks, failedNames } = await persistImportedAudioFiles({
        files: Array.from(files),
        existingTrackCount: tracks.length,
        trackColors: TRACK_COLORS,
        persistAsset: saveAsset,
      });

      if (importedTracks.length > 0) {
        setTracks([...tracks, ...importedTracks]);
      }
      if (failedNames.length > 0) {
        Alert.alert(
          t("studio.importFailedTitle", "Import incomplete"),
          t(
            "studio.importFailedMessage",
            "Some audio files could not be stored locally and were not added to the project.",
          ),
        );
      }
    };
    input.click();
  }, [tracks, setTracks, t]);'''
s, import_count = import_pattern.subn(import_replacement, s, count=1)
if import_count != 1:
    raise SystemExit(f"import replacement count={import_count}")
studio.write_text(s)

Path("tests/studioAssetPersistence.test.ts").write_text(r'''import { describe, expect, it, vi } from "vitest";
import {
  persistImportedAudioFiles,
  resolvePersistedTrackAssets,
} from "../app/studio/persistenceTrust";

function audioFile(name: string, size = 60000) {
  const blob = new Blob([new Uint8Array(size)], { type: "audio/wav" });
  return Object.assign(blob, { name });
}

describe("Studio persisted audio integration", () => {
  it("adds an imported track only after durable asset persistence resolves", async () => {
    let resolveWrite!: (value: string) => void;
    const persistAsset = vi.fn(
      () => new Promise<string>((resolve) => { resolveWrite = resolve; }),
    );
    let settled = false;
    const pending = persistImportedAudioFiles({
      files: [audioFile("take.wav")],
      existingTrackCount: 0,
      trackColors: ["#fff"],
      persistAsset,
    }).then((value) => {
      settled = true;
      return value;
    });

    await Promise.resolve();
    expect(settled).toBe(false);
    resolveWrite("asset://take");
    const result = await pending;
    expect(result.failedNames).toEqual([]);
    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].regions[0].url).toBe("asset://take");
  });

  it("does not create project state for files whose durable write fails", async () => {
    const persistAsset = vi
      .fn()
      .mockResolvedValueOnce("asset://good")
      .mockRejectedValueOnce(new Error("quota"));
    const result = await persistImportedAudioFiles({
      files: [audioFile("good.wav"), audioFile("bad.wav")],
      existingTrackCount: 2,
      trackColors: ["#a", "#b"],
      persistAsset,
    });
    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].regions[0].url).toBe("asset://good");
    expect(result.failedNames).toEqual(["bad.wav"]);
  });

  it("reports unique missing persisted pointers without changing project structure", async () => {
    const tracks = [
      {
        id: "t1",
        regions: [
          { id: "r1", start: 0, duration: 1, url: "asset://missing" },
          { id: "r2", start: 1, duration: 1, url: "asset://missing" },
          { id: "r3", start: 2, duration: 1, url: "asset://ok" },
        ],
      },
    ] as any;
    const resolve = vi.fn(async (url: string) => {
      if (url === "asset://missing") throw new Error("missing");
      return "blob:ok";
    });
    const before = JSON.stringify(tracks);
    await expect(resolvePersistedTrackAssets(tracks, resolve)).resolves.toEqual([
      "asset://missing",
    ]);
    expect(JSON.stringify(tracks)).toBe(before);
    expect(resolve).toHaveBeenCalledTimes(2);
  });
});
''')

print("Studio persistence patch applied")
