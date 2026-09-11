import type { TrackDef } from "../../src/lib/types";

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
