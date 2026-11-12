import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { Repositories } from '../repositories/interfaces'
import {
  categorySchema, listQuerySchema, loginSchema, registerSchema,
  summaryQuerySchema, transactionSchema, transactionUpdateSchema,
} from '../schemas'
import { AuthService } from '../services/auth.service'
import { TransactionService } from '../services/transaction.service'

export function createRoutes(repos: Repositories) {
  const router = Router()
  const auth = new AuthService(repos)
  const transactions = new TransactionService(repos)

  // auth
  router.post('/auth/register', async (req, res) => {
    const result = await auth.register(registerSchema.parse(req.body))
    res.status(201).json(result)
  })
  router.post('/auth/login', async (req, res) => {
    res.json(await auth.login(loginSchema.parse(req.body)))
  })

  // protected routes
  router.use(requireAuth)

  router.get('/categories', async (req, res) => {
    res.json(await repos.categories.findByUser(req.userId))
  })
  router.post('/categories', async (req, res) => {
    const data = categorySchema.parse(req.body)
    res.status(201).json(await repos.categories.create({ ...data, userId: req.userId }))
  })

  router.get('/transactions', async (req, res) => {
    res.json(await transactions.list(req.userId, listQuerySchema.parse(req.query)))
  })
  router.post('/transactions', async (req, res) => {
    const data = transactionSchema.parse(req.body)
    res.status(201).json(await transactions.create(req.userId, data))
  })
  router.put('/transactions/:id', async (req, res) => {
    const data = transactionUpdateSchema.parse(req.body)
    res.json(await transactions.update(req.userId, String(req.params.id), data))
  })
  router.delete('/transactions/:id', async (req, res) => {
    await transactions.remove(req.userId, String(req.params.id))
    res.status(204).send()
  })

  router.get('/dashboard/summary', async (req, res) => {
    const { month } = summaryQuerySchema.parse(req.query)
    res.json(await transactions.summary(req.userId, month))
  })

  return router
}
