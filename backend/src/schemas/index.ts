import { z } from 'zod'

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use o formato YYYY-MM')
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD')

export const registerSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email().transform((v) => v.toLowerCase()),
  senha: z.string().min(6),
})

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase()),
  senha: z.string().min(1),
})

export const categorySchema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(['receita', 'despesa']),
  cor: z.string().default('#6b7280'),
})

export const transactionSchema = z.object({
  categoryId: z.string().min(1),
  tipo: z.enum(['receita', 'despesa']),
  valorCentavos: z.number().int().positive(),
  data: date,
  descricao: z.string().default(''),
  pago: z.boolean().default(true),
})

export const transactionUpdateSchema = transactionSchema.partial()

export const listQuerySchema = z.object({
  month: month.optional(),
  categoryId: z.string().optional(),
  q: z.string().optional(),
})

export const summaryQuerySchema = z.object({ month })
