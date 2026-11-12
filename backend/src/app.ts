import cors from 'cors'
import express from 'express'
import { errorHandler } from './middleware/error'
import { Repositories } from './repositories/interfaces'
import { createRoutes } from './routes'

export function createApp(repos: Repositories) {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))
  app.use('/api', createRoutes(repos))
  app.use(errorHandler)
  return app
}
