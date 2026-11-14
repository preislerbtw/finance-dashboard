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

const categoryFields = {
  nome: z.string().trim().min(1),
  tipo: z.enum(['receita', 'despesa']),
}

export const categorySchema = z.object({ ...categoryFields, cor: z.string().default('#6b7280') })
// na atualização não pode haver defaults, senão campos não enviados seriam sobrescritos
export const categoryUpdateSchema = z.object({ ...categoryFields, cor: z.string() }).partial()

const transactionFields = {
  categoryId: z.string().min(1),
  tipo: z.enum(['receita', 'despesa']),
  valorCentavos: z.number().int().positive(),
  data: date,
}

export const transactionSchema = z.object({
  ...transactionFields,
  descricao: z.string().default(''),
  pago: z.boolean().default(true),
})

// Atualização parcial SEM defaults: só muda o que foi enviado
export const transactionUpdateSchema = z
  .object({ ...transactionFields, descricao: z.string(), pago: z.boolean() })
  .partial()

export const settingsSchema = z.object({
  limiteMensalCentavos: z.number().int().min(0),
})

export const listQuerySchema = z.object({
  month: month.optional(),
  categoryId: z.string().optional(),
  q: z.string().optional(),
})

export const summaryQuerySchema = z.object({ month })

export const monthlyQuerySchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'Use o formato YYYY'),
})