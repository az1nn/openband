export type MidiTargetType =
  | "trackVolume"
  | "trackPan"
  | "masterVolume"
  | "transport"
  | "pluginParam";

export interface MidiTarget {
  type: MidiTargetType;
  trackId?: string;
  trackIndex?: number;
  paramId?: string;
  action?: "play" | "stop" | "togglePlay" | "record" | "loop" | "scrub";
}

export type MidiBindingKind = "cc" | "note";

export interface MidiBinding {
  cc: number;
  channel: number;
  kind: MidiBindingKind;
  target: MidiTarget;
}

export interface McuMapping {
  label: string;
  cc: number;
  channel: number;
  kind: MidiBindingKind;
  target: MidiTarget;
}

export type MidiTargetHandler = (target: MidiTarget, value01: number) => void;

const STORAGE_KEY = "openband_midi_map";

export const midiMap = new Map<string, MidiBinding>();

let targetHandler: MidiTargetHandler | null = null;

function keyFor(kind: MidiBindingKind, channel: number, num: number): string {
  return `${kind}:${channel}:${num}`;
}

export function saveMidiMap(): void {
  try {
    if (typeof localStorage === "undefined") return;
    const entries = Array.from(midiMap.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* persistence unavailable — map stays in memory */
  }
}

export function bindMidi(
  target: MidiTarget,
  cc: number,
  channel: number,
  kind: MidiBindingKind = "cc",
): void {
  const key = keyFor(kind, channel, cc);
  midiMap.set(key, { cc, channel, kind, target });
  saveMidiMap();
}

export function unbindMidi(key: string): void {
  midiMap.delete(key);
  saveMidiMap();
}

export function getBindings(): { key: string; binding: MidiBinding }[] {
  return Array.from(midiMap.entries()).map(([key, binding]) => ({
    key,
    binding,
  }));
}

export function setMidiTargetHandler(fn: MidiTargetHandler | null): void {
  targetHandler = fn;
}

export function applyMidiMessage(data: Uint8Array | number[]): void {
  const status = data[0];
  if (status === undefined) return;
  const channel = status & 0x0f;

  if ((status & 0xf0) === 0xb0) {
    const cc = data[1];
    const value = data[2] ?? 0;
    const binding = midiMap.get(keyFor("cc", channel, cc));
    if (binding && targetHandler) targetHandler(binding.target, value / 127);
  } else if ((status & 0xf0) === 0x90 && (data[2] ?? 0) > 0) {
    const note = data[1];
    const binding = midiMap.get(keyFor("note", channel, note));
    if (binding && targetHandler) targetHandler(binding.target, 1);
  }
}

export function loadMidiMap(): void {
  midiMap.clear();
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const entries = JSON.parse(raw) as [string, MidiBinding][];
    if (!Array.isArray(entries)) return;
    for (const [key, binding] of entries) {
      if (binding && typeof binding.cc === "number") {
        midiMap.set(key, binding);
      }
    }
  } catch {
    /* corrupt or unavailable storage — start fresh */
  }
}

// Mackie Control Universal (MCU) standard surface mapping.
// Faders 1-8 map to MIDI CC 0-7 on channel 0 (track index stored, resolved at dispatch).
// Master fader -> CC 8. Jog wheel -> CC 60 (scrub). Transport buttons are note-on:
//   Play = note 91, Stop = note 92, Record = note 95, Loop = note 86 (all channel 0).
export const MCU_MAP: McuMapping[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    label: `Fader ${i + 1}`,
    cc: i,
    channel: 0,
    kind: "cc" as const,
    target: {
      type: "trackVolume",
      trackIndex: i,
    } as MidiTarget,
  })),
  {
    label: "Master Fader",
    cc: 8,
    channel: 0,
    kind: "cc",
    target: { type: "masterVolume" },
  },
  {
    label: "Jog Wheel",
    cc: 60,
    channel: 0,
    kind: "cc",
    target: { type: "transport", action: "scrub" },
  },
  {
    label: "Play",
    cc: 91,
    channel: 0,
    kind: "note",
    target: { type: "transport", action: "togglePlay" },
  },
  {
    label: "Stop",
    cc: 92,
    channel: 0,
    kind: "note",
    target: { type: "transport", action: "stop" },
  },
  {
    label: "Record",
    cc: 95,
    channel: 0,
    kind: "note",
    target: { type: "transport", action: "record" },
  },
  {
    label: "Loop",
    cc: 86,
    channel: 0,
    kind: "note",
    target: { type: "transport", action: "loop" },
  },
];

export function applyMcuPreset(map: McuMapping[] = MCU_MAP): void {
  for (const entry of map) {
    bindMidi(entry.target, entry.cc, entry.channel, entry.kind);
  }
}
