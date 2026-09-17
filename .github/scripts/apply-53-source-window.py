from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one anchor, found {count}: {old[:80]!r}")
    p.write_text(text.replace(old, new, 1))


def replace_all(path: str, old: str, new: str, expected: int) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != expected:
        raise SystemExit(f"{path}: expected {expected} anchors, found {count}: {old[:80]!r}")
    p.write_text(text.replace(old, new))


# Canonical additive project shape.
replace_once(
    "src/lib/types.ts",
    '''export interface TrackRegion {\n  id: string;\n  start: number;\n  duration: number;\n  url?: string;\n}\n''',
    '''export interface TrackRegion {\n  id: string;\n  start: number;\n  duration: number;\n  /** Seconds into the decoded source where this region begins. Defaults to 0. */\n  offset?: number;\n  /** Selected source-window length in seconds. Defaults to timeline duration. */\n  length?: number;\n  url?: string;\n}\n''',
)
replace_once(
    "backend/src/types.ts",
    '''export interface TrackRegion {\n  id: string;\n  start: number;\n  duration: number;\n}\n''',
    '''export interface TrackRegion {\n  id: string;\n  start: number;\n  duration: number;\n  offset?: number;\n  length?: number;\n}\n''',
)

# One semantic model for edit + render fallbacks.
Path("src/lib/regionEdit.ts").write_text('''import type { TrackRegion } from "./types";\n\n/** Compatibility alias: source-window fields now belong to TrackRegion itself. */\nexport type EditableRegion = TrackRegion;\n\nexport interface RegionSourceWindow {\n  offset: number;\n  length: number;\n}\n\nfunction finiteNonNegative(value: number | undefined, fallback = 0): number {\n  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;\n  return Math.max(0, value);\n}\n\nfunction clamp(value: number, min: number, max: number): number {\n  if (value < min) return min;\n  if (value > max) return max;\n  return value;\n}\n\n/**\n * Resolve the source segment selected by a TrackRegion. Legacy regions remain\n * valid: missing offset reads from source 0 and missing length reads duration.\n * When decoded source duration is known, the selection is clamped to it.\n */\nexport function resolveRegionSourceWindow(\n  region: Pick<TrackRegion, "duration" | "offset" | "length">,\n  sourceDuration?: number,\n): RegionSourceWindow {\n  const fallbackLength = finiteNonNegative(region.duration);\n  const rawOffset = finiteNonNegative(region.offset);\n  const rawLength = finiteNonNegative(region.length, fallbackLength);\n\n  if (typeof sourceDuration !== "number" || !Number.isFinite(sourceDuration)) {\n    return { offset: rawOffset, length: rawLength };\n  }\n\n  const maxSource = Math.max(0, sourceDuration);\n  const offset = Math.min(rawOffset, maxSource);\n  const length = Math.min(rawLength, Math.max(0, maxSource - offset));\n  return { offset, length };\n}\n\nexport function trimRegion(\n  region: EditableRegion,\n  edge: "start" | "end",\n  deltaSec: number,\n  sourceDuration: number,\n): EditableRegion {\n  const { offset, length } = resolveRegionSourceWindow(region, sourceDuration);\n  const maxSource = finiteNonNegative(sourceDuration);\n  const safeStart = finiteNonNegative(region.start);\n  const safeDuration = finiteNonNegative(region.duration);\n\n  if (edge === "start") {\n    const maxDelta = Math.min(length, safeDuration);\n    const minDelta = -Math.min(offset, safeStart);\n    const d = clamp(Number.isFinite(deltaSec) ? deltaSec : 0, minDelta, maxDelta);\n    const newStart = Math.max(0, safeStart + d);\n    const newOffset = clamp(offset + d, 0, maxSource);\n    const newLength = Math.max(0, length - d);\n    return {\n      ...region,\n      start: newStart,\n      duration: newLength,\n      offset: newOffset,\n      length: newLength,\n    };\n  }\n\n  const maxDelta = Math.max(0, maxSource - offset) - length;\n  const minDelta = -Math.min(length, safeDuration);\n  const d = clamp(Number.isFinite(deltaSec) ? deltaSec : 0, minDelta, maxDelta);\n  const newLength = Math.max(0, length + d);\n  return {\n    ...region,\n    duration: newLength,\n    offset,\n    length: newLength,\n  };\n}\n\nexport function splitRegion(\n  region: EditableRegion,\n  atSec: number,\n): [EditableRegion, EditableRegion] {\n  const { offset, length } = resolveRegionSourceWindow(region);\n  const start = finiteNonNegative(region.start);\n  const duration = finiteNonNegative(region.duration);\n  const end = start + duration;\n  const at = clamp(Number.isFinite(atSec) ? atSec : start, start, end);\n  const leftDur = at - start;\n  const rightDur = end - at;\n\n  const left: EditableRegion = {\n    ...region,\n    start,\n    duration: leftDur,\n    offset,\n    length: Math.min(length, leftDur),\n  };\n  const rightSourceLength = Math.max(0, length - leftDur);\n  const right: EditableRegion = {\n    ...region,\n    id: `${region.id}-b`,\n    start: at,\n    duration: rightDur,\n    offset: offset + Math.min(leftDur, length),\n    length: Math.min(rightSourceLength, rightDur),\n  };\n  return [left, right];\n}\n\nexport function moveRegion(\n  region: EditableRegion,\n  deltaSec: number,\n): EditableRegion {\n  return {\n    ...region,\n    start: Math.max(0, finiteNonNegative(region.start) + (Number.isFinite(deltaSec) ? deltaSec : 0)),\n  };\n}\n\nexport function crossfadeGain(a: number, b: number): [number, number] {\n  const total = a + b;\n  const t = total > 0 ? a / total : 0.5;\n  const angle = t * (Math.PI / 2);\n  return [Math.cos(angle), Math.sin(angle)];\n}\n''')

# Canonical strict/full-project renderer.
replace_once(
    "src/lib/midiSynth.ts",
    'import { crossfadeGain } from "./regionEdit";',
    'import { crossfadeGain, resolveRegionSourceWindow } from "./regionEdit";',
)
replace_once(
    "src/lib/midiSynth.ts",
    '''export interface RenderTracksOptions {\n  strict?: boolean;\n  normalizeMixerUnits?: boolean;\n}\n''',
    '''export interface RenderTracksOptions {\n  strict?: boolean;\n  normalizeMixerUnits?: boolean;\n}\n\ntype DecodedRegion = {\n  buffer: AudioBuffer;\n  start: number;\n  duration: number;\n  offset: number;\n  length: number;\n};\n''',
)
replace_all(
    "src/lib/midiSynth.ts",
    '{ buffer: AudioBuffer; start: number; duration: number }[]',
    'DecodedRegion[]',
    4,
)
replace_once(
    "src/lib/midiSynth.ts",
    '            decoded.push({ buffer, start: region.start, duration: region.duration });',
    '''            const { offset, length } = resolveRegionSourceWindow(region, buffer.duration);\n            decoded.push({ buffer, start: region.start, duration: region.duration, offset, length });''',
)
replace_once(
    "src/lib/midiSynth.ts",
    '        decodedRegions.push({ buffer, start: region.start, duration: region.duration });',
    '''        const { offset, length } = resolveRegionSourceWindow(region, buffer.duration);\n        decodedRegions.push({ buffer, start: region.start, duration: region.duration, offset, length });''',
)
replace_once(
    "src/lib/midiSynth.ts",
    '            source.start(r.start, 0, Math.min(r.duration, Math.max(0, duration - r.start)));',
    '''            const playDur = Math.min(\n              r.duration,\n              r.length,\n              Math.max(0, r.buffer.duration - r.offset),\n              Math.max(0, duration - r.start),\n            );\n            if (playDur > 0) source.start(r.start, r.offset, playDur);''',
)
replace_once(
    "src/lib/midiSynth.ts",
    '''          source.buffer = await maybeTimeStretchRegion(region.buffer, playDur);\n          source.connect(gainNode);\n          gainNode.connect(panNode);\n          source.start(region.start, 0, playDur);''',
    '''          const sourceWindowDur = Math.min(\n            playDur,\n            region.length,\n            Math.max(0, region.buffer.duration - region.offset),\n          );\n          if (sourceWindowDur <= 0) continue;\n          const coversWholeSource =\n            region.offset === 0 && Math.abs(region.length - region.buffer.duration) < 0.001;\n          source.buffer = coversWholeSource\n            ? await maybeTimeStretchRegion(region.buffer, sourceWindowDur)\n            : region.buffer;\n          source.connect(gainNode);\n          gainNode.connect(panNode);\n          source.start(region.start, coversWholeSource ? 0 : region.offset, sourceWindowDur);''',
)
replace_once(
    "src/lib/midiSynth.ts",
    '      source.start(region.start, 0, Math.min(region.duration, Math.max(0, duration - region.start)));',
    '''      const playDur = Math.min(\n        region.duration,\n        region.length,\n        Math.max(0, region.buffer.duration - region.offset),\n        Math.max(0, duration - region.start),\n      );\n      if (playDur > 0) source.start(region.start, region.offset, playDur);''',
)

# Secondary mixdown paths must consume the same source-window resolver.
replace_once(
    "src/lib/universalAudio.ts",
    'import { resolveAssetUrl } from "../lib/assetStore";',
    'import { resolveAssetUrl } from "../lib/assetStore";\nimport { resolveRegionSourceWindow } from "../lib/regionEdit";',
)
replace_all(
    "src/lib/universalAudio.ts",
    'regions: { start: number; duration: number; url?: string }[]',
    'regions: { start: number; duration: number; offset?: number; length?: number; url?: string }[]',
    3,
)
replace_once(
    "src/lib/universalAudio.ts",
    '            src.start(region.start, 0, Math.min(region.duration, Math.max(0, duration - region.start)));',
    '''            const { offset, length } = resolveRegionSourceWindow(region, buf.duration);\n            const playDur = Math.min(\n              region.duration,\n              length,\n              Math.max(0, buf.duration - offset),\n              Math.max(0, duration - region.start),\n            );\n            if (playDur > 0) src.start(region.start, offset, playDur);''',
)
replace_once(
    "src/lib/universalAudio.ts",
    '''          const startSample = Math.floor(region.start * sampleRate);\n          const channelLength = decodedChannels[0]?.length || 0;\n          const regionSamples = Math.min(\n            Math.floor(region.duration * sampleRate),\n            channelLength,\n            totalSamples - startSample,\n          );''',
    '''          const startSample = Math.floor(region.start * sampleRate);\n          const channelLength = decodedChannels[0]?.length || 0;\n          const sourceDuration = channelLength / sampleRate;\n          const { offset, length } = resolveRegionSourceWindow(region, sourceDuration);\n          const sourceStartSample = Math.min(\n            channelLength,\n            Math.floor(offset * sampleRate),\n          );\n          const regionSamples = Math.min(\n            Math.floor(region.duration * sampleRate),\n            Math.floor(length * sampleRate),\n            Math.max(0, channelLength - sourceStartSample),\n            Math.max(0, totalSamples - startSample),\n          );''',
)
replace_all(
    "src/lib/universalAudio.ts",
    'const src = ch0[i] || 0;',
    'const src = ch0[sourceStartSample + i] || 0;',
    1,
)
replace_once(
    "src/lib/universalAudio.ts",
    '''              const srcL = ch0[i] || 0;\n              const srcR = ch1[i] || 0;''',
    '''              const srcL = ch0[sourceStartSample + i] || 0;\n              const srcR = ch1[sourceStartSample + i] || 0;''',
)

# Deterministic source semantics + persistence proof.
Path("tests/sourceAwareRegion.test.ts").write_text('''import { beforeEach, describe, expect, it } from "vitest";\nimport { Platform } from "react-native";\nimport {\n  resolveRegionSourceWindow,\n  splitRegion,\n  trimRegion,\n} from "../src/lib/regionEdit";\nimport { exportProject, importProject, loadProject, saveProject } from "../src/lib/projectStore";\n\ndescribe("source-aware region semantics", () => {\n  it("preserves legacy defaults and clamps to decoded source bounds", () => {\n    expect(resolveRegionSourceWindow({ duration: 3 })).toEqual({ offset: 0, length: 3 });\n    expect(resolveRegionSourceWindow({ duration: 3, offset: 8, length: 4 }, 10)).toEqual({\n      offset: 8,\n      length: 2,\n    });\n  });\n\n  it("partitions a non-zero source window on split", () => {\n    const [left, right] = splitRegion(\n      { id: "r", start: 4, duration: 6, offset: 2, length: 6, url: "asset://tone" },\n      6,\n    );\n    expect(left).toMatchObject({ start: 4, duration: 2, offset: 2, length: 2 });\n    expect(right).toMatchObject({ start: 6, duration: 4, offset: 4, length: 4 });\n  });\n\n  it("advances source offset on start trim and preserves it on end trim", () => {\n    const base = { id: "r", start: 4, duration: 6, offset: 2, length: 6 };\n    expect(trimRegion(base, "start", 1.5, 12)).toMatchObject({\n      start: 5.5,\n      duration: 4.5,\n      offset: 3.5,\n      length: 4.5,\n    });\n    expect(trimRegion(base, "end", -1.5, 12)).toMatchObject({\n      start: 4,\n      duration: 4.5,\n      offset: 2,\n      length: 4.5,\n    });\n  });\n});\n\ndescribe("source-window persistence", () => {\n  beforeEach(() => {\n    (Platform as any).OS = "web";\n    window.localStorage.clear();\n  });\n\n  it("retains offset/length and asset identity through save/load and JSON export/import", () => {\n    const region = {\n      id: "r1",\n      start: 1,\n      duration: 1.25,\n      offset: 2.5,\n      length: 1.25,\n      url: "asset://source-aware-fixture",\n    };\n    const project: any = {\n      title: "Source Window",\n      genre: "",\n      key: "C",\n      bpm: 120,\n      tracks: [{\n        id: "t1", name: "Audio", color: "#fff", muted: false, solo: false,\n        volume: 100, pan: 0, sends: {}, regions: [region], sidechainSource: null,\n        plugins: [], automation: {},\n      }],\n      groups: [], buses: [], trackAssignments: {}, masterPlugins: [], masteringChain: [],\n      sendBuses: [], trackAmpChains: {}, mixSnapshots: [], activeMixId: undefined,\n      metronome: { bpm: 120, timeSig: [4, 4], accentInterval: 4, volume: 0.5, enabled: false, countIn: false, countInBars: 2 },\n      recordSettings: { armed: false, inputSource: "mic", quality: "high", sampleRate: 44100, mono: false, preRoll: 0 },\n    };\n\n    expect(saveProject("source-window", project)).toBe(true);\n    expect(loadProject("source-window")?.tracks[0].regions[0]).toMatchObject(region);\n\n    const exported = exportProject("source-window");\n    expect(exported).toBeTruthy();\n    window.localStorage.clear();\n    expect(importProject(exported!)).toBe("source-window");\n    expect(loadProject("source-window")?.tracks[0].regions[0]).toMatchObject(region);\n  });\n});\n''')

# Renderer proof: Web Audio start arguments + native PCM source indexing.
Path("tests/sourceAwareRender.test.ts").write_text('''import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";\nimport { Platform } from "react-native";\n\nconst startCalls: number[][] = [];\n\nfunction param(value = 0) {\n  return {\n    value,\n    setValueAtTime: vi.fn(),\n    linearRampToValueAtTime: vi.fn(),\n    exponentialRampToValueAtTime: vi.fn(),\n    cancelScheduledValues: vi.fn(),\n  };\n}\n\nclass SourceWindowOfflineContext {\n  destination = {};\n  sampleRate: number;\n  length: number;\n  numberOfChannels: number;\n\n  constructor(channels: number, length: number, sampleRate: number) {\n    this.numberOfChannels = channels;\n    this.length = length;\n    this.sampleRate = sampleRate;\n  }\n  createGain() { return { gain: param(1), connect: vi.fn(), disconnect: vi.fn() }; }\n  createStereoPanner() { return { pan: param(0), connect: vi.fn(), disconnect: vi.fn() }; }\n  createBiquadFilter() { return { type: "lowpass", frequency: param(1000), Q: param(0), connect: vi.fn() }; }\n  createConvolver() { return { buffer: null, connect: vi.fn() }; }\n  createBufferSource() {\n    return {\n      buffer: null as AudioBuffer | null,\n      connect: vi.fn(),\n      disconnect: vi.fn(),\n      start: vi.fn((...args: number[]) => startCalls.push(args)),\n      stop: vi.fn(),\n    };\n  }\n  createBuffer(channels: number, length: number, sampleRate: number): AudioBuffer {\n    const data = Array.from({ length: channels }, () => new Float32Array(length));\n    return {\n      numberOfChannels: channels, length, sampleRate, duration: length / sampleRate,\n      getChannelData: (ch: number) => data[ch],\n    } as AudioBuffer;\n  }\n  async decodeAudioData(_ab: ArrayBuffer): Promise<AudioBuffer> {\n    return this.createBuffer(1, this.sampleRate * 4, this.sampleRate);\n  }\n  async startRendering(): Promise<AudioBuffer> {\n    return this.createBuffer(this.numberOfChannels, this.length, this.sampleRate);\n  }\n}\n\nfunction makeSegmentedWav(sampleRate = 8): ArrayBuffer {\n  const samples = new Int16Array(sampleRate);\n  for (let i = 0; i < samples.length; i++) samples[i] = i < sampleRate / 2 ? 8192 : -24576;\n  const ab = new ArrayBuffer(44 + samples.length * 2);\n  const view = new DataView(ab);\n  const text = (o: number, s: string) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));\n  text(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); text(8, "WAVE");\n  text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);\n  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);\n  view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, "data");\n  view.setUint32(40, samples.length * 2, true);\n  for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * 2, samples[i], true);\n  return ab;\n}\n\nfunction readSigned24(view: DataView, offset: number): number {\n  const raw = view.getUint8(offset) | (view.getUint8(offset + 1) << 8) | (view.getUint8(offset + 2) << 16);\n  return raw & 0x800000 ? raw | ~0xffffff : raw;\n}\n\ndescribe("source-aware renderers", () => {\n  const originalOS = Platform.OS;\n  beforeEach(() => {\n    startCalls.length = 0;\n    vi.stubGlobal("OfflineAudioContext", SourceWindowOfflineContext as any);\n    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(16) }));\n  });\n  afterEach(() => {\n    (Platform as any).OS = originalOS;\n    vi.unstubAllGlobals();\n  });\n\n  it("strict full-project renderer schedules the selected source window", async () => {\n    (Platform as any).OS = "web";\n    const { renderTracksToWavBlob } = await import("../src/lib/midiSynth");\n    const track: any = {\n      id: "t1", name: "Audio", color: "#fff", muted: false, solo: false, volume: 100, pan: 0,\n      sends: {}, sidechainSource: null, plugins: [], automation: {},\n      regions: [{ id: "r1", start: 1, duration: 1, offset: 2, length: 1, url: "blob:fixture" }],\n    };\n    const blob = await renderTracksToWavBlob([track], 120, undefined, undefined, undefined, {\n      strict: true, normalizeMixerUnits: true,\n    });\n    expect(blob).toBeInstanceOf(Blob);\n    expect(startCalls).toContainEqual([1, 2, 1]);\n  });\n\n  it("universal Web mixdown schedules the same selected source window", async () => {\n    (Platform as any).OS = "web";\n    const { audioSystem } = await import("../src/lib/universalAudio");\n    const blob = await audioSystem.renderMixdown([{\n      id: "t1", volume: 100, pan: 0, muted: false, solo: false,\n      regions: [{ start: 1, duration: 1, offset: 2, length: 1, url: "blob:fixture" }],\n    }], 4, 44100);\n    expect(blob).toBeInstanceOf(Blob);\n    expect(startCalls).toContainEqual([1, 2, 1]);\n  });\n\n  it("native mixdown begins reading at source offset instead of sample zero", async () => {\n    (Platform as any).OS = "ios";\n    const wav = makeSegmentedWav(8);\n    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => wav }));\n    const { audioSystem } = await import("../src/lib/universalAudio");\n    const blob = await audioSystem.renderMixdown([{\n      id: "t1", volume: 100, pan: 0, muted: false, solo: false,\n      regions: [{ start: 0, duration: 0.5, offset: 0.5, length: 0.5, url: "blob:segmented" }],\n    }], 0.5, 8);\n    const out = new DataView(await blob.arrayBuffer());\n    expect(readSigned24(out, 44)).toBeLessThan(0);\n  });\n});\n''')

print("#53 source-window implementation staged")
