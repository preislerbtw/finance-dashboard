import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../errors'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Dados inválidos', details: err.issues })
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message })
  }
  console.error(err)
  res.status(500).json({ error: 'Erro interno do servidor' })
}
