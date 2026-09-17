from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one anchor, found {count}")
    p.write_text(text.replace(old, new, 1))


replace_once(
    "src/lib/universalAudio.ts",
    '''            let buf = await this.decodeAudio(ab, ctx);\n            if (track.plugins && track.plugins.length > 0) {\n              const { applyPluginChain } = await import("../lib/pluginChain");\n              buf = await applyPluginChain(buf, track.plugins, sampleRate, {\n                duration,\n                modTime: region.start,\n              });\n            }\n            const src = ctx.createBufferSource();''',
    '''            let buf = await this.decodeAudio(ab, ctx);\n            let { offset, length } = resolveRegionSourceWindow(region, buf.duration);\n            if (track.plugins && track.plugins.length > 0 && length > 0) {\n              const sourceStartFrame = Math.min(\n                buf.length,\n                Math.floor(offset * buf.sampleRate),\n              );\n              const sourceFrameCount = Math.min(\n                Math.max(0, buf.length - sourceStartFrame),\n                Math.floor(length * buf.sampleRate),\n              );\n              if (sourceStartFrame > 0 || sourceFrameCount < buf.length) {\n                const selected = ctx.createBuffer(\n                  Math.max(1, buf.numberOfChannels),\n                  Math.max(1, sourceFrameCount),\n                  buf.sampleRate,\n                );\n                for (let channel = 0; channel < buf.numberOfChannels; channel++) {\n                  selected\n                    .getChannelData(channel)\n                    .set(\n                      buf\n                        .getChannelData(channel)\n                        .subarray(sourceStartFrame, sourceStartFrame + sourceFrameCount),\n                    );\n                }\n                buf = selected;\n                offset = 0;\n                length = Math.min(length, buf.duration);\n              }\n              const { applyPluginChain } = await import("../lib/pluginChain");\n              buf = await applyPluginChain(buf, track.plugins, sampleRate, {\n                duration,\n                modTime: region.start,\n              });\n              length = Math.min(length, buf.duration);\n            }\n            const src = ctx.createBufferSource();''',
)
replace_once(
    "src/lib/universalAudio.ts",
    '''            const { offset, length } = resolveRegionSourceWindow(region, buf.duration);\n            const playDur = Math.min(''',
    '''            const playDur = Math.min(''',
)

p = Path("tests/sourceAwareRender.test.ts")
text = p.read_text()
anchor = '''  it("native mixdown begins reading at source offset instead of sample zero", async () => {\n    (Platform as any).OS = "ios";\n    const wav = makeSegmentedWav(8);\n    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => wav }));\n    const { audioSystem } = await import("../src/lib/universalAudio");\n    const blob = await audioSystem.renderMixdown([{\n      id: "t1", volume: 100, pan: 0, muted: false, solo: false,\n      regions: [{ start: 0, duration: 0.5, offset: 0.5, length: 0.5, url: "blob:segmented" }],\n    }], 0.5, 8);\n    const out = new DataView(await blob.arrayBuffer());\n    expect(readSigned24(out, 44)).toBeLessThan(0);\n  });\n'''
if text.count(anchor) != 1:
    raise SystemExit("tests/sourceAwareRender.test.ts: native source-window anchor not unique")
extra = anchor + '''\n  it("renders the right-hand split from the later source segment", async () => {\n    (Platform as any).OS = "ios";\n    const wav = makeSegmentedWav(8);\n    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => wav }));\n    const { splitRegion } = await import("../src/lib/regionEdit");\n    const { audioSystem } = await import("../src/lib/universalAudio");\n    const [, right] = splitRegion(\n      { id: "r", start: 0, duration: 1, offset: 0, length: 1, url: "blob:segmented" },\n      0.5,\n    );\n    const blob = await audioSystem.renderMixdown([{\n      id: "t1", volume: 100, pan: 0, muted: false, solo: false, regions: [right],\n    }], 1, 8);\n    const out = new DataView(await blob.arrayBuffer());\n    const rightTimelineFrame = 4;\n    const bytesPerStereo24Frame = 6;\n    expect(readSigned24(out, 44 + rightTimelineFrame * bytesPerStereo24Frame)).toBeLessThan(0);\n  });\n\n  it("renders an inward start-trim from the later source segment", async () => {\n    (Platform as any).OS = "ios";\n    const wav = makeSegmentedWav(8);\n    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ arrayBuffer: async () => wav }));\n    const { trimRegion } = await import("../src/lib/regionEdit");\n    const { audioSystem } = await import("../src/lib/universalAudio");\n    const trimmed = trimRegion(\n      { id: "r", start: 0, duration: 1, offset: 0, length: 1, url: "blob:segmented" },\n      "start",\n      0.5,\n      1,\n    );\n    const blob = await audioSystem.renderMixdown([{\n      id: "t1", volume: 100, pan: 0, muted: false, solo: false, regions: [trimmed],\n    }], 1, 8);\n    const out = new DataView(await blob.arrayBuffer());\n    const trimmedTimelineFrame = 4;\n    const bytesPerStereo24Frame = 6;\n    expect(readSigned24(out, 44 + trimmedTimelineFrame * bytesPerStereo24Frame)).toBeLessThan(0);\n  });\n'''
p.write_text(text.replace(anchor, extra, 1))

print("#53 audio-review fix staged")
