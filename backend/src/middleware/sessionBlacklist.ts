import crypto from "crypto"
import { Response, NextFunction } from "express"
import { AuthenticatedRequest } from "./authMiddleware"

const blacklistedTokens = new Set<string>()

export function addToBlacklist(token: string) {
  blacklistedTokens.add(hashToken(token))
}

export function checkBlacklist(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next()
  }

  const token = authHeader.split(" ")[1]
  const tokenHash = hashToken(token)

  if (blacklistedTokens.has(tokenHash)) {
    res.status(401).json({ error: "Sessão revogada." })
    return
  }

  next()
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}
