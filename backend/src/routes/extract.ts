import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { upload } from "../middleware/upload";
import { runDemucs, checkDemucsInstalled } from "../services/demucs";
import { runMock } from "../services/mock";
import { requireAuth, type AuthenticatedRequest } from "../middleware/authMiddleware";
import type { ExtractResponse, ErrorResponse } from "../types";

const router = Router();

const STEMS_DIR = process.env.VERCEL
  ? "/tmp/stems"
  : path.resolve(process.cwd(), "stems");

const isProduction = process.env.NODE_ENV === "production";

const MP3_BITRATES: Record<string, number[]> = {
  "3": [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  "2": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  "0": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};

const MP3_SAMPLE_RATES: Record<string, number[]> = {
  "3": [44100, 48000, 32000],
  "2": [22050, 24000, 16000],
  "0": [11025, 12000, 8000],
};

async function getAudioDuration(filePath: string): Promise<number> {
  let fd: fs.promises.FileHandle | undefined;
  try {
    const stat = await fs.promises.stat(filePath);
    fd = await fs.promises.open(filePath, "r");
    const head = Buffer.alloc(65536);
    const { bytesRead } = await fd.read(head, 0, 65536, 0);
    const buf = head.subarray(0, bytesRead);

    if (
      buf.length >= 12 &&
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WAVE"
    ) {
      const byteRate = buf.readUInt32LE(28);
      if (byteRate > 0) return Math.round((stat.size / byteRate) * 100) / 100;
      const sampleRate = buf.readUInt32LE(24);
      const channels = buf.readUInt16LE(22);
      const bits = buf.readUInt16LE(34);
      if (sampleRate > 0 && channels > 0 && bits > 0) {
        const dataSize = stat.size - 44;
        const secs = dataSize / (channels * (bits / 8)) / sampleRate;
        return Math.round(secs * 100) / 100;
      }
    }

    for (let i = 0; i + 3 < buf.length; i++) {
      if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
        const version = (buf[i + 1] >> 3) & 0x03;
        const bitrateIndex = (buf[i + 2] >> 4) & 0x0f;
        const srIndex = (buf[i + 2] >> 2) & 0x03;
        const padding = (buf[i + 2] >> 1) & 0x01;
        const bitrate = MP3_BITRATES[String(version)]?.[bitrateIndex] ?? 0;
        const sampleRate = MP3_SAMPLE_RATES[String(version)]?.[srIndex] ?? 0;
        if (bitrate > 0 && sampleRate > 0) {
          const frameSize =
            Math.floor((144 * bitrate * 1000) / sampleRate) + padding;
          if (frameSize > 0) {
            const frames = stat.size / frameSize;
            const samplesPerFrame = version === 3 ? 1152 : 576;
            const secs = (frames * samplesPerFrame) / sampleRate;
            return Math.round(secs * 100) / 100;
          }
        }
      }
    }

    return 0;
  } catch (e) {
    console.error("getAudioDuration error:", e);
    return 0;
  } finally {
    if (fd) {
      try {
        await fd.close();
      } catch (e) {
        console.error("getAudioDuration fd close error:", e);
      }
    }
  }
}

function cleanup(filePath: string | undefined): void {
  if (!filePath) return;
  fs.unlink(filePath, (err) => {
    if (err) console.error("cleanup error:", err);
  });
}

router.post("/extract", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  upload.single("audio")(req, res, async (err) => {
    try {
      if (err) {
        console.error("Upload error:", err.message);
        const body: ErrorResponse = {
          error: "Upload failed",
          ...(isProduction ? {} : { details: err.message }),
        };
        return res.status(400).json(body);
      }

      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }

      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const userId = req.userTokenData?.userId ?? "anon";

      try {
        const duration = await getAudioDuration(req.file.path);
        const hasDemucs = await checkDemucsInstalled();
        const stems = hasDemucs
          ? await runDemucs({
              inputPath: req.file.path,
              stemDir: STEMS_DIR,
              userId,
            })
          : await runMock(req.file.path, STEMS_DIR, userId);

        if (req.file) cleanup(req.file.path);

        const body: ExtractResponse = {
          jobId,
          stems,
          duration,
        };

        res.json(body);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erro desconhecido";

        if (message === "DEMUCS_NOT_FOUND") {
          try {
            if (!req.file) throw new Error("No file uploaded");
            const duration = await getAudioDuration(req.file.path);
            const stems = await runMock(req.file.path, STEMS_DIR, userId);
            cleanup(req.file.path);
            return res.json({
              jobId,
              stems,
              duration,
              warning:
                "Demucs não instalado. Usando simulação. Para resultados reais: pip install demucs",
            });
          } catch (e) {
            console.error("Stem processing error:", e);
            cleanup(req.file?.path);
            return res
              .status(500)
              .json({ error: "Erro ao processar áudio (fallback falhou)" });
          }
        }

        cleanup(req.file?.path);
        console.error("Extract error:", message);
        res.status(500).json({
          error: "Erro ao processar áudio",
          ...(isProduction ? {} : { details: message }),
        });
      }
    } catch (e) {
      console.error("Fatal error:", e);
      cleanup(req.file?.path);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

router.get("/stems/:filename", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const filename = req.params.filename as string;
  if (
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("\0")
  ) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const userId = req.userTokenData?.userId ?? "anon";
  if (!filename.startsWith(`${userId}__`)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const filePath = path.resolve(STEMS_DIR, filename);
  if (!filePath.startsWith(STEMS_DIR)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.sendFile(filePath, (err) => {
    if (err) {
      if (res.headersSent) return;
      console.error("sendFile error:", err);
      res.status(404).json({ error: "Stem file not found" });
    }
  });
});

router.post("/stems/manifest", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { projectId, bpm, key, chords, tracks } = req.body || {};

  if (!projectId || bpm === undefined || !key || !Array.isArray(chords) || !Array.isArray(tracks)) {
    return res.status(400).json({
      error:
        "projectId, bpm, key, chords[] e tracks[] são obrigatórios",
    });
  }

  const manifest = {
    generator: "Openband DAW Engine v2.0",
    projectOriginId: projectId,
    sessionMetadata: {
      globalBpm: bpm,
      globalKey: key,
      chordsSequence: chords,
    },
    stemsRegistry: tracks.map(
      (track: Record<string, unknown>) => ({
        filename: `${String(track.name || "track").toLowerCase().replace(/\s+/g, "_")}.wav`,
        trackType:
          track.midiNotes &&
          Array.isArray(track.midiNotes) &&
          track.midiNotes.length > 0
            ? "midi_synthesizer"
            : "audio_track",
        trackName: String(track.name || "track"),
        isMono: false,
        ...(track.midiNotes &&
        Array.isArray(track.midiNotes) &&
        track.midiNotes.length > 0
          ? {
              patchRef: String(track.name || "track")
                .toLowerCase()
                .replace(/\s+/g, "_"),
            }
          : {}),
      }),
    ),
  };

  res.json(manifest);
});

export default router;
