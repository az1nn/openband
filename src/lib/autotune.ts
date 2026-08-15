export function hzToMidi(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440);
}

export function midiToHz(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

export const CHROMATIC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function quantizeToScale(
  pitchHz: number,
  rootMidi: number,
  scaleIntervals: number[],
  toleranceCents = 0,
): number {
  if (pitchHz <= 0) return pitchHz;

  const midi = hzToMidi(pitchHz);
  const rounded = Math.round(midi);
  const pitchClass = ((rounded % 12) + 12) % 12;

  const allowed = new Set<number>(
    scaleIntervals.map((i) => ((rootMidi + i) % 12 + 12) % 12),
  );

  if (allowed.has(pitchClass)) return pitchHz;

  let bestDist = Infinity;
  let bestPc = pitchClass;
  for (const a of allowed) {
    const dist = Math.min(
      Math.abs(pitchClass - a),
      Math.abs(pitchClass - a + 12),
      Math.abs(pitchClass - a - 12),
    );
    if (dist < bestDist) {
      bestDist = dist;
      bestPc = a;
    }
  }

  const targetMidi = rounded + (bestPc - pitchClass);
  const targetHz = midiToHz(targetMidi);
  const cents = 1200 * Math.log2(targetHz / pitchHz);

  if (Math.abs(cents) < toleranceCents) return pitchHz;

  return targetHz;
}
