import type { TrackDef } from "./types";

export interface BusRoutingNode {
  id: string;
  name: string;
  color: string;
  volume: number;
  muted: boolean;
  inputGain: GainNode;
  outputGain: GainNode;
  plugins: { node: AudioNode }[];
}

export interface BusRouteDef {
  id: string;
  name: string;
  color: string;
  volume: number;
  muted: boolean;
}

export function buildBusRouteGraph(
  ctx: OfflineAudioContext | AudioContext,
  tracks: TrackDef[],
  buses: BusRouteDef[],
  masterGain: GainNode,
): { trackOutputs: Map<string, AudioNode>; busNodes: Map<string, BusRoutingNode>; cleanup: () => void } {
  const busNodes = new Map<string, BusRoutingNode>();
  const trackOutputs = new Map<string, AudioNode>();
  const sendGainNodes: GainNode[] = [];

  for (const bus of buses) {
    const inputGain = ctx.createGain();
    inputGain.gain.value = 1;

    const outputGain = ctx.createGain();
    outputGain.gain.value = bus.muted ? 0 : bus.volume;

    outputGain.connect(masterGain);

    busNodes.set(bus.id, {
      id: bus.id,
      name: bus.name,
      color: bus.color,
      volume: bus.volume,
      muted: bus.muted,
      inputGain,
      outputGain,
      plugins: [],
    });
  }

  for (const track of tracks) {
    if (track.muted) continue;

    const trackGain = ctx.createGain();
    trackGain.gain.value = track.volume ?? 1;

    const panNode = ctx.createStereoPanner();
    panNode.pan.value = track.pan ?? 0;
    panNode.connect(trackGain);

    const outputId = track.outputId || "master";

    if (outputId !== "master" && busNodes.has(outputId)) {
      trackGain.connect(busNodes.get(outputId)!.inputGain);
    } else {
      trackGain.connect(masterGain);
    }

    if (track.sends) {
      for (const [busId, sendAmount] of Object.entries(track.sends)) {
        if (typeof sendAmount === "number" && sendAmount > 0 && busNodes.has(busId)) {
          const sendGain = ctx.createGain();
          sendGain.gain.value = sendAmount;
          trackGain.connect(sendGain);
          sendGain.connect(busNodes.get(busId)!.inputGain);
          sendGainNodes.push(sendGain);
        }
      }
    }

    trackOutputs.set(track.id, panNode);
  }

  for (const bus of busNodes.values()) {
    bus.inputGain.connect(bus.outputGain);
  }

  const cleanup = () => {
    for (const bus of busNodes.values()) {
      try { bus.inputGain.disconnect(); } catch (e) {
        console.warn("busRouter input disconnect failed:", e);
      }
      try { bus.outputGain.disconnect(); } catch (e) {
        console.warn("busRouter output disconnect failed:", e);
      }
    }
    for (const node of trackOutputs.values()) {
      try { node.disconnect(); } catch (e) {
        console.warn("busRouter track disconnect failed:", e);
      }
    }
    for (const sendGain of sendGainNodes) {
      try { sendGain.disconnect(); } catch (e) {
        console.warn("busRouter send disconnect failed:", e);
      }
    }
  };

  return { trackOutputs, busNodes, cleanup };
}

export function createDefaultBuses(): BusRouteDef[] {
  return [
    {
      id: "bus-drums",
      name: "Drums",
      color: "#ff6482",
      volume: 1,
      muted: false,
    },
    {
      id: "bus-instruments",
      name: "Instruments",
      color: "#5ac8fa",
      volume: 1,
      muted: false,
    },
    {
      id: "bus-vocals",
      name: "Vocals",
      color: "#ffcc00",
      volume: 1,
      muted: false,
    },
  ];
}

export function assignTrackToBus(trackName: string): string | null {
  const l = trackName.toLowerCase();
  if (
    l.includes("bateria") || l.includes("drums") || l.includes("kick") ||
    l.includes("snare") || l.includes("hi-hat") || l.includes("percussão") ||
    l.includes("percussion") || l.includes("clap") || l.includes("cymbal") ||
    l.includes("tamborim") || l.includes("surdo") || l.includes("pandeiro")
  ) {
    return "bus-drums";
  }
  if (
    l.includes("vocal") || l.includes("voz") || l.includes("lead") ||
    l.includes("rap") || l.includes("vox")
  ) {
    return "bus-vocals";
  }
  if (
    l.includes("baixo") || l.includes("bass") || l.includes("guitarra") ||
    l.includes("violão") || l.includes("guitar") || l.includes("piano") ||
    l.includes("keys") || l.includes("synth") || l.includes("pad") ||
    l.includes("cordas") || l.includes("strings") || l.includes("sample") ||
    l.includes("melodia") || l.includes("melody") || l.includes("horn") ||
    l.includes("sax") || l.includes("organ") || l.includes("brass") ||
    l.includes("orquestra") || l.includes("orchestra")
  ) {
    return "bus-instruments";
  }
  return null;
}
