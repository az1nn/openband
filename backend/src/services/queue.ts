import fs from "fs";
import path from "path";

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "pending";

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

export interface Job<T = unknown> {
  id: string;
  type: string;
  data: T;
  status: JobStatus;
  progress: number; // 0 to 100
  createdAt: number;
  completedAt?: number;
  result?: unknown;
  error?: string;
}

const jobs = new Map<string, Job>();
const jobListeners = new Map<string, Set<(job: Job) => void>>();
const PROCESSING_DELAY_MS = 2000;

let jobCounter = 0;

export function addJob<T>(type: string, data: T): string {
  const id = `job_${Date.now()}_${++jobCounter}`;
  const job: Job<T> = {
    id,
    type,
    data,
    status: "queued",
    progress: 0,
    createdAt: Date.now(),
  };
  jobs.set(id, job as Job);
  processJobAsync(id);
  return id;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function getJobStatus(id: string): {
  status: JobStatus;
  progress: number;
  result?: unknown;
  error?: string;
} | null {
  const job = jobs.get(id);
  if (!job) return null;
  return { status: job.status, progress: job.progress, result: job.result, error: job.error };
}

export function subscribeToJob(jobId: string, callback: (job: Job) => void): () => void {
  if (!jobListeners.has(jobId)) {
    jobListeners.set(jobId, new Set());
  }
  jobListeners.get(jobId)!.add(callback);
  return () => {
    const set = jobListeners.get(jobId);
    if (set) {
      set.delete(callback);
      if (set.size === 0) jobListeners.delete(jobId);
    }
  };
}

function notifyJobListeners(job: Job) {
  const set = jobListeners.get(job.id);
  if (set) {
    for (const cb of set) {
      try {
        cb(job);
      } catch {
        // ignore listener error
      }
    }
  }
}

async function processJobAsync(id: string): Promise<void> {
  const job = jobs.get(id);
  if (!job) return;

  job.status = "processing";
  job.progress = 10;
  notifyJobListeners(job);

  try {
    await new Promise<void>((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS / 3));
    job.progress = 40;
    notifyJobListeners(job);

    await new Promise<void>((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS / 3));
    job.progress = 75;
    notifyJobListeners(job);

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
    job.progress = 100;
    job.result = { stems: written };
    job.completedAt = Date.now();
    notifyJobListeners(job);
  } catch (e: unknown) {
    job.status = "failed";
    job.progress = 100;
    job.error = e instanceof Error ? e.message : "Unknown error";
    notifyJobListeners(job);
  }
}
