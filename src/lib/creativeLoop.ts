import type { TrackDef, TrackRegion } from "./types";

function updateTrackRegions(
  tracks: TrackDef[],
  trackId: string,
  update: (regions: TrackRegion[]) => TrackRegion[],
): TrackDef[] {
  return tracks.map((track) =>
    track.id === trackId ? { ...track, regions: update(track.regions) } : track,
  );
}

export function moveRegionBySeconds(
  tracks: TrackDef[],
  trackId: string,
  regionId: string,
  deltaSeconds: number,
): TrackDef[] {
  return updateTrackRegions(tracks, trackId, (regions) =>
    regions.map((region) =>
      region.id === regionId
        ? { ...region, start: Math.max(0, region.start + deltaSeconds) }
        : region,
    ),
  );
}

export function duplicateRegion(
  tracks: TrackDef[],
  trackId: string,
  regionId: string,
  newRegionId: string,
): TrackDef[] {
  return updateTrackRegions(tracks, trackId, (regions) => {
    const sourceIndex = regions.findIndex((region) => region.id === regionId);
    if (sourceIndex < 0) return regions;
    const source = regions[sourceIndex];
    const copy: TrackRegion = {
      ...source,
      id: newRegionId,
      start: source.start + source.duration,
    };
    return [
      ...regions.slice(0, sourceIndex + 1),
      copy,
      ...regions.slice(sourceIndex + 1),
    ];
  });
}

export function repeatRegion(
  tracks: TrackDef[],
  trackId: string,
  regionId: string,
  newRegionIds: string[],
): TrackDef[] {
  return updateTrackRegions(tracks, trackId, (regions) => {
    const sourceIndex = regions.findIndex((region) => region.id === regionId);
    if (sourceIndex < 0 || newRegionIds.length === 0) return regions;
    const source = regions[sourceIndex];
    const repeats = newRegionIds.map((id, index) => ({
      ...source,
      id,
      start: source.start + source.duration * (index + 1),
    }));
    return [
      ...regions.slice(0, sourceIndex + 1),
      ...repeats,
      ...regions.slice(sourceIndex + 1),
    ];
  });
}

export function deleteRegion(
  tracks: TrackDef[],
  trackId: string,
  regionId: string,
): TrackDef[] {
  return updateTrackRegions(tracks, trackId, (regions) =>
    regions.filter((region) => region.id !== regionId),
  );
}
