import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { getJwtSecret } from "../config/jwt"

export interface AuthenticatedRequest extends Request {
  userTokenData?: { userId: string; tier: string }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Acesso negado. Token não fornecido." })
    return
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; tier: string }
    req.userTokenData = decoded
    next()
  } catch (e) {
    console.error("requireAuth token error:", e)
    res.status(401).json({ error: "Sessão expirada ou Token inválido." })
  }
}

export function requireAuthQuery(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization
  let token: string | undefined

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]
  } else if (typeof req.query.token === "string") {
    token = req.query.token
  } else if (typeof req.query.access_token === "string") {
    token = req.query.access_token
  }

  if (!token) {
    res.status(401).json({ error: "Acesso negado. Token não fornecido." })
    return
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; tier: string }
    req.userTokenData = decoded
    next()
  } catch (e) {
    console.error("requireAuthQuery token error:", e)
    res.status(401).json({ error: "Sessão expirada ou Token inválido." })
  }
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; tier: string }
      req.userTokenData = decoded
    } catch (e) {
      console.debug("optionalAuth token ignored:", e)
      req.userTokenData = undefined
    }
  }

  next()
}
