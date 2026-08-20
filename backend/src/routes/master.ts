import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { upload } from "../middleware/upload";
import { requireAuth, type AuthenticatedRequest } from "../middleware/authMiddleware";

function safeJsonParse(s: unknown): unknown {
  if (typeof s !== "string" || !s) return undefined;
  try {
    return JSON.parse(s);
  } catch (e) {
    console.error("JSON parse failed:", s.slice(0, 100), e);
    return undefined;
  }
}

function parseAudioHeader(
  buf: Buffer,
): { format: string; sampleRate: number | null; bitDepth: number | null } {
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WAVE"
  ) {
    const sampleRate = buf.readUInt32LE(24);
    const bitDepth = buf.readUInt16LE(34);
    return { format: "wav", sampleRate, bitDepth };
  }
  const mp3RateByVersion: Record<number, number[]> = {
    3: [44100, 48000, 32000],
    2: [22050, 24000, 16000],
    0: [11025, 12000, 8000],
  };
  for (let i = 0; i + 2 < buf.length; i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
      const version = (buf[i + 1] >> 3) & 0x03;
      const srIndex = (buf[i + 2] >> 2) & 0x03;
      const sampleRate = mp3RateByVersion[version]?.[srIndex] ?? null;
      return { format: "mp3", sampleRate, bitDepth: null };
    }
  }
  if (buf.length >= 3 && buf.toString("ascii", 0, 3) === "ID3") {
    return { format: "mp3", sampleRate: null, bitDepth: null };
  }
  return { format: "unknown", sampleRate: null, bitDepth: null };
}

export function composeBounceResult(opts: {
  userId: string;
  outputFilename: string;
  format: string;
  bitDepth: number | null;
  sampleRate: number | null;
  size: number;
  pluginStates: unknown;
}) {
  return {
    jobId: `${Date.now()}`,
    filename: opts.outputFilename,
    url: `/api/master/download/${opts.outputFilename}`,
    format: opts.format,
    bitDepth: opts.bitDepth,
    sampleRate: opts.sampleRate,
    size: opts.size,
    applied: false,
    warning:
      "Server-side mastering chain is not implemented; pluginStates were not applied. Master client-side in MasteringSuite.",
    pluginStates: opts.pluginStates,
    jobParams: {
      bitDepth: opts.bitDepth,
      sampleRate: opts.sampleRate,
      format: opts.format,
    },
  };
}

const router = Router();

const MASTER_DIR = process.env.VERCEL
  ? "/tmp/masters"
  : path.resolve(process.cwd(), "masters");

if (!fs.existsSync(MASTER_DIR)) {
  fs.mkdirSync(MASTER_DIR, { recursive: true });
}

router.post(
  "/master/bounce",
  requireAuth,
  (req: Request, res: Response, next) => {
    upload.single("audio")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE")
            return res
              .status(413)
              .json({ error: "Arquivo muito grande. Máximo 200MB." });
          return res.status(400).json({
            error: "Erro no upload.",
            ...(process.env.NODE_ENV === "production"
              ? {}
              : { details: err.message }),
          });
        }
        return res.status(400).json({
          error: "Erro no upload.",
          ...(process.env.NODE_ENV === "production"
            ? {}
            : { details: err instanceof Error ? err.message : String(err) }),
        });
      }
      next();
    });
  },
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Nenhum arquivo de áudio enviado." });
      }

      const { pluginStates } = req.body || {};
      const userId = req.userTokenData?.userId ?? "anon";

      const filePath = req.file.path;

      const headFd = await fs.promises.open(filePath, "r");
      let header: { format: string; sampleRate: number | null; bitDepth: number | null };
      try {
        const headBuf = Buffer.alloc(65536);
        const { bytesRead } = await headFd.read(headBuf, 0, 65536, 0);
        header = parseAudioHeader(headBuf.subarray(0, bytesRead));
      } finally {
        await headFd.close();
      }

      const outputFormat = header.format === "mp3" ? "mp3" : "wav";
      const outputFilename = `master_${userId}_${Date.now()}.${outputFormat}`;
      const outputPath = path.resolve(MASTER_DIR, outputFilename);
      await new Promise<void>((resolve, reject) => {
        const inputStream = fs.createReadStream(filePath);
        const outputStream = fs.createWriteStream(outputPath);
        let done = false;
        function cleanup(err?: Error) {
          if (done) return;
          done = true;
          inputStream.destroy();
          outputStream.destroy();
          fs.unlink(outputPath, (e) => {
            if (e) console.error("cleanup error:", e);
          });
          if (err) reject(err);
        }

        outputStream.on("error", cleanup);
        inputStream.on("error", cleanup);

        inputStream.pipe(outputStream);

        outputStream.on("finish", () => {
          fs.unlink(filePath, (err) => {
            if (err) console.error("cleanup error:", err);
          });
          done = true;
          resolve();
        });
      });

      res.json(
        composeBounceResult({
          userId,
          outputFilename,
          format: header.format,
          bitDepth: header.bitDepth,
          sampleRate: header.sampleRate,
          size: (await fs.promises.stat(outputPath)).size,
          pluginStates: pluginStates ? safeJsonParse(pluginStates) : undefined,
        }),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erro desconhecido";
      console.error("Master bounce error:", message);
      if (req.file) {
        fs.unlink(req.file.path, (e) => {
          if (e) console.error("cleanup error:", e);
        });
      }
      const isProduction = process.env.NODE_ENV === "production";
      res.status(500).json({
        error: "Erro ao processar master",
        ...(isProduction ? {} : { details: message }),
      });
    }
  },
);

router.get("/master/download/:filename", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const filename = req.params.filename as string;
  if (
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("\0")
  ) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const userId = req.userTokenData?.userId ?? "anon";
  if (!filename.startsWith(`master_${userId}_`)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const filePath = path.resolve(MASTER_DIR, filename);
  if (!filePath.startsWith(MASTER_DIR)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.sendFile(filePath, (err) => {
    if (err) {
      if (res.headersSent) return;
      console.error("sendFile error:", err);
      res.status(404).json({ error: "Master file not found" });
    }
  });
});

export default router;
