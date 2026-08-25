export async function pitchShift(
  buffer: AudioBuffer,
  semitones: number,
): Promise<AudioBuffer> {
  if (semitones === 0) return buffer;

  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;
  const duration = buffer.duration;
  const ratio = Math.pow(2, semitones / 12);

  const newDuration = duration;
  const newLength = Math.ceil(newDuration * sampleRate);

  const ctx = new OfflineAudioContext(channels, newLength, sampleRate);
  const output = ctx.createBuffer(channels, newLength, sampleRate);

  const grainSize = 2048;
  const hopSize = Math.floor(grainSize / 4);

  for (let ch = 0; ch < channels; ch++) {
    const input = buffer.getChannelData(ch);
    const out = output.getChannelData(ch);
    const norm = new Float32Array(newLength);
    const window = new Float32Array(grainSize);

    for (let i = 0; i < grainSize; i++) {
      window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / grainSize));
    }

    const readPos = { current: 0 };

    while (readPos.current < input.length) {
      const writePos = Math.floor(readPos.current * ratio);

      for (let i = 0; i < grainSize; i++) {
        const srcIdx = Math.floor(readPos.current + i);
        const dstIdx = writePos + i;

        if (srcIdx >= input.length || dstIdx >= newLength) break;

        const sample = input[srcIdx] * window[i];
        out[dstIdx] += sample;
        norm[dstIdx] += window[i];
      }

      readPos.current += hopSize;
    }

    for (let i = 0; i < newLength; i++) {
      out[i] = norm[i] > 0 ? out[i] / norm[i] : 0;
    }
  }

  return output;
}

export async function timeStretch(
  buffer: AudioBuffer,
  rate: number,
): Promise<AudioBuffer> {
  if (rate === 1) return buffer;

  const sampleRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;
  const newDuration = buffer.duration / rate;
  const newLength = Math.ceil(newDuration * sampleRate);

  const ctx = new OfflineAudioContext(channels, newLength, sampleRate);
  const output = ctx.createBuffer(channels, newLength, sampleRate);

  const grainSize = 2048;
  const hopSize = Math.floor(grainSize / 4);

  for (let ch = 0; ch < channels; ch++) {
    const input = buffer.getChannelData(ch);
    const out = output.getChannelData(ch);
    const norm = new Float32Array(newLength);
    const window = new Float32Array(grainSize);

    for (let i = 0; i < grainSize; i++) {
      window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / grainSize));
    }

    let readPos = 0;

    while (readPos < input.length) {
      const writePos = Math.floor(readPos / rate);

      for (let i = 0; i < grainSize; i++) {
        const srcIdx = Math.floor(readPos + i);
        const dstIdx = writePos + i;

        if (srcIdx >= input.length || dstIdx >= newLength) break;

        out[dstIdx] += input[srcIdx] * window[i];
        norm[dstIdx] += window[i];
      }

      readPos += hopSize;
    }

    for (let i = 0; i < newLength; i++) {
      out[i] = norm[i] > 0 ? out[i] / norm[i] : 0;
    }
  }

  return output;
}
