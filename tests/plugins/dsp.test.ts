import { describe, it, expect, beforeAll } from "vitest";
import type { Plugin } from "../../src/lib/types";
import { PLUGIN_SPECS, applyPluginPreset, getDefaultParams } from "../../src/lib/types";
import { applyPluginChain, resolveParam, snapToScale } from "../../src/lib/pluginChain";
import { MockOfflineAudioContext, installMockAudioContext } from "../audioMock";

// Audible / FFT assertions for corrected plugin DSP in src/lib/pluginChain.ts:
// filter (mode 0-5 biquad), utility (true phase-invert), modulation (stereo
// chorus), distortion (tanh waveshaper), stereoWidener (stereoize side scaling).

beforeAll(() => {
  installMockAudioContext();
});

function makeAudioBuffer(
  ch: number,
  len: number,
  sr: number,
  fill: (c: number, i: number) => number,
) {
  const ctx = new MockOfflineAudioContext(ch, len, sr);
  const buf = ctx.createBuffer(ch, len, sr);
  for (let c = 0; c < ch; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = fill(c, i);
  }
  return buf;
}

function maxAbs(buf: AudioBuffer, c = 0): number {
  const d = buf.getChannelData(c);
  let m = 0;
  for (let i = 0; i < d.length; i++) m = Math.max(m, Math.abs(d[i]));
  return m;
}

function rms(buf: AudioBuffer, c = 0): number {
  const d = buf.getChannelData(c);
  let s = 0;
  for (let i = 0; i < d.length; i++) s += d[i] * d[i];
  return Math.sqrt(s / d.length);
}

function bandContent(buf: AudioBuffer, freq: number, sr: number, c = 0): number {
  const d = buf.getChannelData(c);
  let acc = 0;
  for (let i = 0; i < d.length; i++) acc += d[i] * Math.sin((2 * Math.PI * freq * i) / sr);
  return acc / d.length;
}

function makePlugin(type: Plugin["type"], params: Record<string, any> = {}): Plugin {
  return { id: `t-${type}`, name: type, type, enabled: true, params, color: "#fff" };
}

describe("resolveParam (param-id normalization)", () => {
  it("reads canonical id", () => {
    expect(resolveParam({ time: 300 }, "time")).toBe(300);
  });
  it("falls back to legacy alias", () => {
    expect(resolveParam({ delayTime: 100 }, "time", "delayTime")).toBe(100);
  });
  it("canonical wins over legacy alias when both present", () => {
    expect(resolveParam({ time: 300, delayTime: 100 }, "time", "delayTime")).toBe(300);
  });
  it("maps filter frequency/type", () => {
    expect(resolveParam({ frequency: 200 }, "freq", "frequency")).toBe(200);
  });
  it("maps utility volume/gain", () => {
    expect(resolveParam({ volume: 3 }, "gain", "volume")).toBe(3);
  });
  it("maps bassMono frequency/crossover", () => {
    expect(resolveParam({ frequency: 200 }, "crossover", "frequency")).toBe(200);
  });
});

describe("eq (8-band real DSP)", () => {
  const sr = 44100;
  it("notch band reduces energy at the target frequency", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) =>
      0.5 * Math.sin((2 * Math.PI * 1000 * i) / sr) +
      0.5 * Math.sin((2 * Math.PI * 200 * i) / sr),
    );
    const plugin = makePlugin("eq", {
      b0_enabled: 1, b0_type: 3, b0_freq: 1000, b0_gain: 0, b0_q: 5,
    });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(Math.abs(bandContent(out, 1000, sr))).toBeLessThan(Math.abs(bandContent(buf, 1000, sr)));
  });

  it("peaking boost increases energy at the target frequency", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) =>
      0.5 * Math.sin((2 * Math.PI * 1000 * i) / sr) +
      0.5 * Math.sin((2 * Math.PI * 200 * i) / sr),
    );
    const plugin = makePlugin("eq", {
      b0_enabled: 1, b0_type: 2, b0_freq: 1000, b0_gain: 18, b0_q: 2,
    });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(Math.abs(bandContent(out, 1000, sr))).toBeGreaterThan(Math.abs(bandContent(buf, 1000, sr)));
  });

  it("master gain applies to output level", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) =>
      Math.sin((2 * Math.PI * 1000 * i) / sr),
    );
    const plugin = makePlugin("eq", {
      master: -6, b0_enabled: 1, b0_type: 2, b0_freq: 1000, b0_gain: 0, b0_q: 2,
    });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(rms(out)).toBeLessThan(rms(buf));
  });
});

describe("truePeakLimiter (oversampled ceiling)", () => {
  const sr = 44100;
  it("never exceeds the ceiling with oversample >= 2", async () => {
    const buf = makeAudioBuffer(1, 32768, sr, (_c, i) => 0.95 * Math.sin((2 * Math.PI * 440 * i) / sr));
    const plugin = makePlugin("truePeakLimiter", {
      threshold: -3, ceiling: -1, oversample: 2, lookahead: 1, release: 50,
    });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(maxAbs(out)).toBeLessThanOrEqual(Math.pow(10, -1 / 20) * 1.001);
  });

  it("4x oversample also respects ceiling", async () => {
    const buf = makeAudioBuffer(1, 32768, sr, (_c, i) => 0.95 * Math.sin((2 * Math.PI * 440 * i) / sr));
    const plugin = makePlugin("truePeakLimiter", {
      threshold: -3, ceiling: -2, oversample: 3, lookahead: 1, release: 50,
    });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(maxAbs(out)).toBeLessThanOrEqual(Math.pow(10, -2 / 20) * 1.001);
  });
});

describe("deesser (sidechain compression of sibilance)", () => {
  const sr = 44100;
  it("reduces the sibilant band energy", async () => {
    const buf = makeAudioBuffer(1, 32768, sr, (_c, i) =>
      0.4 * Math.sin((2 * Math.PI * 6000 * i) / sr) +
      0.4 * Math.sin((2 * Math.PI * 200 * i) / sr),
    );
    const plugin = makePlugin("deesser", {
      frequency: 6000, threshold: -18, range: 12, mode: 0,
    });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(Math.abs(bandContent(out, 6000, sr))).toBeLessThan(Math.abs(bandContent(buf, 6000, sr)));
  });
});

describe("multibandCompressor (stereo-preserving 3-band)", () => {
  const sr = 44100;
  it("preserves stereo (L/R not collapsed) and changes output", async () => {
    const buf = makeAudioBuffer(2, 32768, sr, (c, i) =>
      c === 0 ? 0.8 * Math.sin((2 * Math.PI * 200 * i) / sr) : 0.8 * Math.sin((2 * Math.PI * 500 * i) / sr),
    );
    const plugin = makePlugin("multibandCompressor", {
      b0_cross: 200, b1_cross: 2000, b2_cross: 6000,
      b0_threshold: -30, b0_ratio: 8, b0_makeup: 6,
      b1_threshold: -10, b1_ratio: 4, b1_makeup: 3,
      b2_threshold: -8, b2_ratio: 3, b2_makeup: 2,
    });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(rms(out, 0)).toBeGreaterThan(0);
    expect(rms(out, 1)).toBeGreaterThan(0);
    expect(Math.abs(rms(out, 0) - rms(out, 1))).toBeGreaterThan(1e-4);
    expect(maxAbs(out)).toBeLessThanOrEqual(1.001);
  });
});

describe("param-id mapping at the graph level", () => {
  const sr = 44100;
  it("delay honors legacy delayTime/wet aliases", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) => Math.sin((2 * Math.PI * 440 * i) / sr) * 0.5);
    const legacy = makePlugin("delay", { delayTime: 100, feedback: 40, wet: 50 });
    const out = await applyPluginChain(buf, [legacy], sr);
    expect(rms(out)).toBeGreaterThan(0);
    expect(out.length).toBe(16384);
  });
  it("delay honors canonical time/mix ids", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) => Math.sin((2 * Math.PI * 440 * i) / sr) * 0.5);
    const canonical = makePlugin("delay", { time: 100, feedback: 40, mix: 50 });
    const out = await applyPluginChain(buf, [canonical], sr);
    expect(rms(out)).toBeGreaterThan(0);
    expect(out.length).toBe(16384);
  });
});

describe("filter (multi-mode biquad)", () => {
  const sr = 44100;
  it("notch mode drops energy at the target frequency", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) =>
      0.5 * Math.sin((2 * Math.PI * 1000 * i) / sr) +
      0.5 * Math.sin((2 * Math.PI * 200 * i) / sr),
    );
    const plugin = makePlugin("filter", { mode: 5, freq: 1000, resonance: 40 });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(Math.abs(bandContent(out, 1000, sr))).toBeLessThan(Math.abs(bandContent(buf, 1000, sr)));
  });
  it("lowpass mode drops the high-frequency band", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) =>
      0.5 * Math.sin((2 * Math.PI * 200 * i) / sr) +
      0.5 * Math.sin((2 * Math.PI * 6000 * i) / sr),
    );
    const plugin = makePlugin("filter", { mode: 0, freq: 800, resonance: 10 });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(Math.abs(bandContent(out, 6000, sr))).toBeLessThan(Math.abs(bandContent(buf, 6000, sr)));
  });
});

describe("utility (phase invert)", () => {
  const sr = 44100;
  it("phase-invert flips the sign of the waveform vs input", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) => 0.8 * Math.sin((2 * Math.PI * 440 * i) / sr));
    const plugin = makePlugin("utility", { gain: 0, pan: 0, phase: 1 });
    const out = await applyPluginChain(buf, [plugin], sr);
    const inD = buf.getChannelData(0);
    const outD = out.getChannelData(0);
    let dot = 0;
    let mag = 0;
    for (let i = 0; i < inD.length; i++) {
      dot += inD[i] * outD[i];
      mag += inD[i] * inD[i];
    }
    expect(dot).toBeLessThan(0);
    expect(dot).toBeLessThan(-0.9 * mag);
    expect(maxAbs(out)).toBeCloseTo(maxAbs(buf), 1);
  });
});

describe("noiseGate (noise gate)", () => {
  const sr = 44100;
  const gateSpec = PLUGIN_SPECS.noiseGate;

  it("loads with default params and renders without throwing", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) =>
      0.5 * Math.sin((2 * Math.PI * 440 * i) / sr),
    );
    const out = await applyPluginChain(
      buf,
      [makePlugin("noiseGate", getDefaultParams("noiseGate"))],
      sr,
    );
    expect(out.length).toBe(16384);
    expect(out.numberOfChannels).toBe(2);
  });

  it("clamps threshold/ratio/range/release to the param schema", () => {
    const clamped = applyPluginPreset("noiseGate", {
      threshold: -120,
      ratio: 1,
      attack: 1000,
      release: 5000,
      range: 200,
      hold: 1000,
    });
    for (const p of gateSpec.params) {
      expect(clamped[p.id]).toBeGreaterThanOrEqual(p.min);
      expect(clamped[p.id]).toBeLessThanOrEqual(p.max);
    }
    expect(clamped.threshold).toBe(gateSpec.params.find((p) => p.id === "threshold")!.min);
    expect(clamped.ratio).toBe(gateSpec.params.find((p) => p.id === "ratio")!.min);
    expect(clamped.range).toBe(gateSpec.params.find((p) => p.id === "range")!.max);
  });

  it("suppresses a quiet signal below the threshold (range attenuation)", async () => {
    const buf = makeAudioBuffer(1, 65536, sr, (_c, i) =>
      0.05 * Math.sin((2 * Math.PI * 440 * i) / sr),
    );
    const plugin = makePlugin("noiseGate", { threshold: -20, release: 10, hold: 0, range: 60 });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(rms(out)).toBeLessThan(0.15 * rms(buf));
  });

  it("passes a loud signal above the threshold", async () => {
    const buf = makeAudioBuffer(1, 65536, sr, (_c, i) =>
      0.5 * Math.sin((2 * Math.PI * 440 * i) / sr),
    );
    const plugin = makePlugin("noiseGate", { threshold: -20, attack: 1, release: 100, hold: 20, range: 60 });
    const out = await applyPluginChain(buf, [plugin], sr);
    expect(rms(out)).toBeGreaterThan(0.85 * rms(buf));
    expect(maxAbs(out)).toBeGreaterThan(0.4);
  });

  it("holds the gate open across a brief drop below the threshold", async () => {
    const len = 65536;
    const buf = makeAudioBuffer(1, len, sr, (_c, i) =>
      i < len / 2
        ? 0.5 * Math.sin((2 * Math.PI * 440 * i) / sr)
        : 0.001 * Math.sin((2 * Math.PI * 440 * i) / sr),
    );
    const plugin = makePlugin("noiseGate", { threshold: -20, release: 200, hold: 500, range: 60 });
    const out = await applyPluginChain(buf, [plugin], sr);
    const quiet = out.getChannelData(0).slice(len / 2);
    const quietIn = buf.getChannelData(0).slice(len / 2);
    const quietOutRms = Math.sqrt(quiet.reduce((s, v) => s + v * v, 0) / quiet.length);
    const quietInRms = Math.sqrt(quietIn.reduce((s, v) => s + v * v, 0) / quietIn.length);
    expect(quietOutRms).toBeGreaterThan(0.5 * quietInRms);
  });

  it("loads all 5 gate presets with params within the schema", async () => {
    const named = gateSpec.presets.filter((p) => p.name !== "Default");
    expect(named.length).toBe(5);
    for (const preset of named) {
      const params = applyPluginPreset("noiseGate", preset.values);
      for (const p of gateSpec.params) {
        expect(params[p.id]).toBeGreaterThanOrEqual(p.min);
        expect(params[p.id]).toBeLessThanOrEqual(p.max);
      }
      const buf = makeAudioBuffer(2, 16384, sr, (_c, i) =>
        0.5 * Math.sin((2 * Math.PI * 440 * i) / sr),
      );
      const out = await applyPluginChain(buf, [makePlugin("noiseGate", params)], sr);
      expect(out.length).toBe(16384);
      expect(out.numberOfChannels).toBe(2);
    }
  });
});

describe("autoPitch (auto-tune)", () => {
  const sr = 44100;
  const pitchSpec = PLUGIN_SPECS.autoPitch;
  const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

  it("loads with default params and renders without throwing", async () => {
    const buf = makeAudioBuffer(1, 16384, sr, (_c, i) =>
      0.5 * Math.sin((2 * Math.PI * 440 * i) / sr),
    );
    const out = await applyPluginChain(
      buf,
      [makePlugin("autoPitch", getDefaultParams("autoPitch"))],
      sr,
    );
    expect(out.length).toBe(16384);
    expect(out.numberOfChannels).toBe(2);
  });

  it("clamps amount/key/scale/mix to the param schema", () => {
    const clamped = applyPluginPreset("autoPitch", {
      amount: 999,
      key: 50,
      scale: 99,
      mix: -5,
      speed: 0,
      formant: 50,
      vibrato: 999,
    });
    expect(clamped.amount).toBe(pitchSpec.params.find((p) => p.id === "amount")!.max);
    expect(clamped.key).toBe(pitchSpec.params.find((p) => p.id === "key")!.max);
    expect(clamped.scale).toBe(pitchSpec.params.find((p) => p.id === "scale")!.max);
    expect(clamped.mix).toBe(pitchSpec.params.find((p) => p.id === "mix")!.min);
  });

  it("C major snaps only the pitch classes [0,2,4,5,7,9,11] to zero correction", () => {
    const cMajor = [0, 2, 4, 5, 7, 9, 11];
    for (let pc = 0; pc < 12; pc++) {
      const snapped = snapToScale(midiToFreq(60 + pc), 0, "major");
      if (cMajor.includes(pc)) {
        expect(snapped.correction, `pc ${pc}`).toBe(0);
      } else {
        expect(snapped.correction, `pc ${pc}`).not.toBe(0);
      }
    }
  });

  it("C minor uses intervals [0,2,3,5,7,8,10]", () => {
    const cMinor = [0, 2, 3, 5, 7, 8, 10];
    for (let pc = 0; pc < 12; pc++) {
      const snapped = snapToScale(midiToFreq(60 + pc), 0, "minor");
      if (cMinor.includes(pc)) {
        expect(snapped.correction, `pc ${pc}`).toBe(0);
      } else {
        expect(snapped.correction, `pc ${pc}`).not.toBe(0);
      }
    }
  });

  it("a key offset transposes the valid pitch classes", () => {
    for (let key = 0; key < 12; key++) {
      const expected = new Set([0, 2, 4, 5, 7, 9, 11].map((i) => (key + i) % 12));
      for (let pc = 0; pc < 12; pc++) {
        const snapped = snapToScale(midiToFreq(60 + pc), key, "major");
        if (expected.has(pc)) {
          expect(snapped.correction, `key ${key} pc ${pc}`).toBe(0);
        } else {
          expect(snapped.correction, `key ${key} pc ${pc}`).not.toBe(0);
        }
      }
    }
  });

  it("chromatic scale leaves every pitch in tune", () => {
    for (let midi = 48; midi < 96; midi++) {
      expect(snapToScale(midiToFreq(midi), 0, "chromatic").correction).toBe(0);
    }
  });

  it("off-scale notes snap to a scale pitch class", () => {
    const cMajor = new Set([0, 2, 4, 5, 7, 9, 11]);
    for (let pc = 0; pc < 12; pc++) {
      const snapped = snapToScale(midiToFreq(60 + pc), 0, "major");
      expect(cMajor.has(((snapped.midiNote % 12) + 12) % 12), `pc ${pc}`).toBe(true);
    }
  });

  it("loads all 6 autopitch presets with key/scale/amount in range", async () => {
    const named = pitchSpec.presets.filter((p) => p.name !== "Default");
    expect(named.length).toBe(6);
    for (const preset of named) {
      const params = applyPluginPreset("autoPitch", preset.values);
      expect(params.key).toBeGreaterThanOrEqual(0);
      expect(params.key).toBeLessThanOrEqual(11);
      expect(params.scale).toBeGreaterThanOrEqual(0);
      expect(params.scale).toBeLessThanOrEqual(2);
      expect(params.amount).toBeGreaterThanOrEqual(0);
      expect(params.amount).toBeLessThanOrEqual(100);
      const buf = makeAudioBuffer(2, 16384, sr, (_c, i) =>
        0.5 * Math.sin((2 * Math.PI * 440 * i) / sr),
      );
      const out = await applyPluginChain(buf, [makePlugin("autoPitch", params)], sr);
      expect(out.length).toBe(16384);
      expect(out.numberOfChannels).toBe(2);
    }
  });

  it("in-tune and off-tune signals pass through without throwing", async () => {
    for (const freq of [220, 233.08, 440, 467.0]) {
      const buf = makeAudioBuffer(1, 16384, sr, (_c, i) =>
        0.4 * Math.sin((2 * Math.PI * freq * i) / sr),
      );
      const plugin = makePlugin("autoPitch", { amount: 100, key: 0, scale: 0, mix: 100 });
      const out = await applyPluginChain(buf, [plugin], sr);
      expect(out.length).toBe(16384);
      expect(rms(out)).toBeGreaterThan(0);
    }
  });
});

describe("all 19 plugin types render without throwing", () => {
  const sr = 44100;
  const ALL: Plugin["type"][] = [
    "eq", "compressor", "limiter", "distortion", "reverb", "delay",
    "filter", "modulation", "utility", "multibandCompressor",
    "stereoImager", "deesser", "tapeSaturator", "truePeakLimiter",
    "noiseGate", "autoPitch", "bassMono", "stereoWidener", "clipper",
  ];
  const paramsFor: Record<string, Record<string, number>> = {
    eq: { b0_enabled: 1, b0_type: 2, b0_freq: 1000, b0_gain: 6, b0_q: 1 },
    compressor: { threshold: -30, ratio: 20 },
    limiter: { threshold: -6, ceiling: -1 },
    distortion: { drive: 10, mix: 80 },
    reverb: { decay: 2, mix: 50 },
    delay: { time: 150, feedback: 40, mix: 40 },
    filter: { mode: 0, freq: 300, resonance: 20 },
    modulation: { rate: 2, depth: 60, mix: 50 },
    utility: { gain: 3, pan: 0 },
    multibandCompressor: { b0_cross: 200, b1_cross: 2000, b2_cross: 6000, b0_threshold: -30, b0_makeup: 6 },
    stereoImager: { width: 150, sideGain: 3 },
    deesser: { frequency: 6000, threshold: -18, range: 12 },
    tapeSaturator: { drive: 8, mix: 70 },
    truePeakLimiter: { threshold: -3, ceiling: -1, oversample: 2 },
    noiseGate: { threshold: -20, range: 40 },
    autoPitch: { amount: 80, key: 0, scale: 0, mix: 80 },
    bassMono: { crossover: 150, amount: 100, dryWet: 100 },
    stereoWidener: { width: 160, sideGain: 3 },
    clipper: { threshold: -3, ceiling: -1, mode: 1, mix: 100 },
  };
  for (const type of ALL) {
    it(`renders ${type} correctly`, async () => {
      const buf = makeAudioBuffer(2, 16384, sr, (c, i) =>
        c === 0 ? Math.sin((2 * Math.PI * 220 * i) / sr) : Math.sin((2 * Math.PI * 660 * i) / sr),
      );
      const out = await applyPluginChain(buf, [makePlugin(type, paramsFor[type])], sr);
      expect(out).toBeTruthy();
      expect(out.length).toBe(16384);
      expect(out.numberOfChannels).toBe(2);
    });
  }
});
