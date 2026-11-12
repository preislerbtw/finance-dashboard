import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AppError } from '../errors'

declare global {
  namespace Express {
    interface Request {
      userId: string
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'Token ausente')
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as { sub: string }
    req.userId = payload.sub
    next()
  } catch {
    throw new AppError(401, 'Token inválido ou expirado')
  }
}
