import { describe, it, expect } from "vitest";
import { buildAutoPitchNode } from "../src/lib/pluginChain";

function makeMockAudioContext() {
  const baseNode = () => ({
    connect: () => {},
    disconnect: () => {},
    start: () => {},
    onaudioprocess: null as null | (() => void),
  });
  return {
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    createScriptProcessor: (_size: number, _in: number, _out: number) => ({
      ...baseNode(),
      onaudioprocess: null as null | (() => void),
    }),
    createBiquadFilter: () => ({ ...baseNode() }),
    createGain: () => ({
      ...baseNode(),
      gain: { value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
    }),
    createBufferSource: () => ({ ...baseNode() }),
    createBuffer: (_ch: number, len: number, sr: number) => ({
      length: len,
      sampleRate: sr,
      numberOfChannels: 1,
      getChannelData: () => new Float32Array(len),
    }),
  } as unknown as BaseAudioContext;
}

describe("autoPitch plugin graph", () => {
  it("builds a connected node without throwing", () => {
    const ctx = makeMockAudioContext();
    const node = buildAutoPitchNode(ctx, { key: 0, scale: 2, formant: 50, amount: 80 });
    expect(node).toBeTruthy();
    expect(typeof (node as any).connect).toBe("function");
  });

  it("returns a node for every scale selection", () => {
    const ctx = makeMockAudioContext();
    for (let scale = 0; scale < 5; scale++) {
      const node = buildAutoPitchNode(ctx, { scale });
      expect(node).toBeTruthy();
    }
  });

  it("toggles the formant param without throwing", () => {
    const ctx = makeMockAudioContext();
    expect(() => buildAutoPitchNode(ctx, { formant: 0 })).not.toThrow();
    expect(() => buildAutoPitchNode(ctx, { formant: 100 })).not.toThrow();
  });

  it("fails soft to a passthrough gain when ScriptProcessor is unavailable", () => {
    const ctx = {
      currentTime: 0,
      sampleRate: 44100,
      destination: {},
      createGain: () => ({ connect: () => {}, disconnect: () => {} }),
    } as unknown as BaseAudioContext;
    expect(() => buildAutoPitchNode(ctx, { formant: 50 })).not.toThrow();
  });
});
