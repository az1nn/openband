export interface StemAnalysisResult {
  stemName: string;
  spectralCentroid: number;
  maskingCollisionScore: number;
  suggestedEQ: { frequency: number; gain: number; q: number }[];
}

export function analyzeStemSpectrum(stemName: string, buffer: Float32Array): StemAnalysisResult {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += Math.abs(buffer[i]);
  }
  const energy = buffer.length > 0 ? sum / buffer.length : 0;
  const maskingCollisionScore = Math.min(1.0, energy * 2.5);

  const suggestedEQ = stemName.toLowerCase().includes("bass")
    ? [{ frequency: 250, gain: -2.5, q: 1.4 }]
    : [{ frequency: 2000, gain: 1.5, q: 1.0 }];

  return {
    stemName,
    spectralCentroid: energy * 1000,
    maskingCollisionScore,
    suggestedEQ,
  };
}
