import fs from "fs";
import path from "path";

type JobStatus = "pending" | "processing" | "completed" | "failed";

const STEMS_DIR = process.env.VERCEL
  ? "/tmp/stems"
  : path.resolve(process.cwd(), "stems");

async function writeSilentWav(filePath: string, durationSec: number): Promise<void> {
  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;
  const numSamples = sampleRate * durationSec;
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);

  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  await fs.promises.writeFile(filePath, buffer);
}

interface Job<T = unknown> {
  id: string;
  type: string;
  data: T;
  status: JobStatus;
  createdAt: number;
  completedAt?: number;
  result?: unknown;
  error?: string;
}

const jobs = new Map<string, Job>();
const PROCESSING_DELAY_MS = 8000;

let jobCounter = 0;

export function addJob<T>(type: string, data: T): string {
  const id = `job_${Date.now()}_${++jobCounter}`;
  const job: Job<T> = {
    id,
    type,
    data,
    status: "pending",
    createdAt: Date.now(),
  };
  jobs.set(id, job as Job);
  processJobAsync(id);
  return id;
}

export function getJobStatus(id: string): {
  status: JobStatus;
  result?: unknown;
  error?: string;
} | null {
  const job = jobs.get(id);
  if (!job) return null;
  return { status: job.status, result: job.result, error: job.error };
}

async function processJobAsync(id: string): Promise<void> {
  const job = jobs.get(id);
  if (!job) return;

  job.status = "processing";

   try {
    await new Promise<void>((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));

    if (!fs.existsSync(STEMS_DIR)) fs.mkdirSync(STEMS_DIR, { recursive: true });

    const stems = [
      { name: "vocals.wav", key: "vocals" },
      { name: "drums.wav", key: "drums" },
      { name: "bass.wav", key: "bass" },
      { name: "other.wav", key: "other" },
    ];

    const written = await Promise.all(
      stems.map(async (s) => {
        const filePath = path.join(STEMS_DIR, `mock_${id}_${s.key}.wav`);
        await writeSilentWav(filePath, 30);
        const size = (await fs.promises.stat(filePath)).size;
        return {
          name: s.name,
          url: `/api/stems/mock_${id}_${s.key}.wav`,
          duration: 30,
          size,
        };
      }),
    );

    job.status = "completed";
    job.result = { stems: written };
    job.completedAt = Date.now();
  } catch (e: unknown) {
    job.status = "failed";
    job.error = e instanceof Error ? e.message : "Unknown error";
  }
}
