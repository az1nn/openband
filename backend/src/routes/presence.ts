import { Router, Response } from "express";
import { requireAuth, requireAuthQuery, type AuthenticatedRequest } from "../middleware/authMiddleware";

interface ClientEntry {
  id: string;
  res: Response;
  userId: string;
  userName: string;
}

interface PresenceData {
  userId: string;
  userName: string;
  cursorX: number;
  activeTrackId: string | null;
  playheadPosition: number;
  lastSeen: number;
}

const MAX_KEY_LENGTH = 128;
const MAX_USERNAME_LENGTH = 64;
const MAX_CONNECTIONS_PER_PROJECT = 50;
const STALE_TIMEOUT_MS = 5 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

const projectClients = new Map<string, Map<string, ClientEntry>>();
const userPresence = new Map<string, Map<string, PresenceData>>();

function isValidKey(key: string): boolean {
  if (!key || key.length > MAX_KEY_LENGTH) return false;
  if (key.includes("..") || key.includes("/") || key.includes("\\")) return false;
  return true;
}

function sanitizeString(s: string, maxLen: number): string {
  return s.replace(/[^\w\s@.\-]/g, "").slice(0, maxLen);
}

function getProjectClients(projectId: string): Map<string, ClientEntry> {
  if (!projectClients.has(projectId)) {
    projectClients.set(projectId, new Map());
  }
  return projectClients.get(projectId)!;
}

function getUserPresence(projectId: string): Map<string, PresenceData> {
  if (!userPresence.has(projectId)) {
    userPresence.set(projectId, new Map());
  }
  return userPresence.get(projectId)!;
}

function broadcastToProject(
  projectId: string,
  data: unknown,
  excludeUserId?: string,
): void {
  const clients = getProjectClients(projectId);
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const [id, client] of clients) {
    if (client.userId === excludeUserId) continue;
    try {
      const ok = client.res.write(message);
      if (!ok) {
        clients.delete(id);
      }
    } catch (e) {
      console.error("presence cursor failed", e);
      clients.delete(id);
    }
  }
}

function cleanupClient(projectId: string, clientEntry: ClientEntry): void {
  const clients = getProjectClients(projectId);
  clients.delete(clientEntry.id);

  const presence = getUserPresence(projectId);
  presence.delete(clientEntry.userId);

  broadcastToProject(projectId, {
    userId: clientEntry.userId,
    disconnected: true,
  });
}

setInterval(() => {
  const now = Date.now();
  for (const [projectId, clients] of projectClients) {
    for (const [, client] of clients) {
      const presence = getUserPresence(projectId);
      const data = presence.get(client.userId);
      if (data && now - data.lastSeen > STALE_TIMEOUT_MS) {
        cleanupClient(projectId, client);
      }
    }
    if (clients.size === 0) {
      projectClients.delete(projectId);
      userPresence.delete(projectId);
    }
  }
}, CLEANUP_INTERVAL_MS);

const router = Router();

router.get(
  "/api/presence/:projectId/subscribe",
  requireAuthQuery,
  (req: AuthenticatedRequest, res: Response) => {
    const { projectId } = req.params as { projectId: string };

    if (!isValidKey(projectId)) {
      res.status(400).json({ error: "Invalid projectId" });
      return;
    }

    const userId = sanitizeString(
      req.userTokenData?.userId ||
        (req.query.userId as string) ||
        `anon-${Date.now()}`,
      MAX_KEY_LENGTH,
    );
    const userName = sanitizeString(
      (req.query.userName as string) || userId,
      MAX_USERNAME_LENGTH,
    );

    const clients = getProjectClients(projectId);
    const existingForUser = Array.from(clients.values()).filter((c) => c.userId === userId);
    if (existingForUser.length >= 3) {
      res.status(429).json({ error: "Too many connections per user" });
      return;
    }

    if (clients.size >= MAX_CONNECTIONS_PER_PROJECT) {
      res.status(503).json({ error: "Project connection limit reached" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    res.write(`data: ${JSON.stringify({ connected: true, userId })}\n\n`);

    const clientEntry: ClientEntry = {
      id: `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      res,
      userId,
      userName,
    };

    clients.set(clientEntry.id, clientEntry);

    const existingPresence = getUserPresence(projectId);
    for (const [, data] of existingPresence) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    existingPresence.set(userId, {
      userId,
      userName,
      cursorX: 0,
      activeTrackId: null,
      playheadPosition: 0,
      lastSeen: Date.now(),
    });

    broadcastToProject(projectId, {
      userId,
      userName,
      joined: true,
    });

      const keepAlive = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
        const p = getUserPresence(projectId);
        const d = p.get(userId);
        if (d) d.lastSeen = Date.now();
      } catch (e) {
        console.error("presence cleanup failed", e);
        clearInterval(keepAlive);
      }
    }, 15000);

    req.on("close", () => {
      clearInterval(keepAlive);
      cleanupClient(projectId, clientEntry);
    });

    req.on("error", () => {
      clearInterval(keepAlive);
      cleanupClient(projectId, clientEntry);
    });
  },
);

router.post(
  "/api/presence/:projectId/cursor",
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const { projectId } = req.params as { projectId: string };

    if (!isValidKey(projectId)) {
      res.status(400).json({ error: "Invalid projectId" });
      return;
    }

    const { userId, userName, cursorX, activeTrackId, playheadPosition } =
      req.body as {
        userId: string;
        userName?: string;
        cursorX: number;
        activeTrackId: string | null;
        playheadPosition: number;
      };

    if (!userId || userId.length > MAX_KEY_LENGTH) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    if (typeof cursorX !== "number" || typeof playheadPosition !== "number") {
      res.status(400).json({ error: "Invalid cursor data" });
      return;
    }

    const presence = getUserPresence(projectId);
    presence.set(userId, {
      userId,
      userName: sanitizeString(userName || userId, MAX_USERNAME_LENGTH),
      cursorX,
      activeTrackId,
      playheadPosition,
      lastSeen: Date.now(),
    });

    broadcastToProject(
      projectId,
      { userId, userName: sanitizeString(userName || userId, MAX_USERNAME_LENGTH), cursorX, activeTrackId, playheadPosition },
      userId,
    );

    res.json({ ok: true });
  },
);

router.post(
  "/api/presence/:projectId/leave",
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const { projectId } = req.params as { projectId: string };

    if (!isValidKey(projectId)) {
      res.status(400).json({ error: "Invalid projectId" });
      return;
    }

    const { userId } = req.body as { userId: string };
    if (!userId || userId.length > MAX_KEY_LENGTH) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const clients = getProjectClients(projectId);
    for (const [, client] of clients) {
      if (client.userId === userId) {
        cleanupClient(projectId, client);
        break;
      }
    }

    res.json({ ok: true });
  },
);

export default router;
