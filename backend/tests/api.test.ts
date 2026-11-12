import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { createInMemoryRepositories } from '../src/repositories/memory'

describe('fluxo principal', () => {
  const app = createApp(createInMemoryRepositories())

  it('registra, cria transações e gera o resumo do mês', async () => {
    const reg = await request(app).post('/api/auth/register')
      .send({ nome: 'Pai', email: 'pai@teste.com', senha: '123456' })
    expect(reg.status).toBe(201)
    const auth = { Authorization: `Bearer ${reg.body.token}` }

    const cats = (await request(app).get('/api/categories').set(auth)).body
    const salario = cats.find((c: any) => c.nome === 'Salário')
    const mercado = cats.find((c: any) => c.nome === 'Mercado')

    await request(app).post('/api/transactions').set(auth).send({
      categoryId: salario.id, tipo: 'receita', valorCentavos: 300000, data: '2026-11-05' })
    await request(app).post('/api/transactions').set(auth).send({
      categoryId: mercado.id, tipo: 'despesa', valorCentavos: 45090, data: '2026-11-08', descricao: 'Mercado do mês' })

    const list = await request(app).get('/api/transactions?month=2026-11&q=mercado').set(auth)
    expect(list.body).toHaveLength(1)

    const summary = await request(app).get('/api/dashboard/summary?month=2026-11').set(auth)
    expect(summary.body.saldoCentavos).toBe(254910)
    expect(summary.body.despesasPorCategoria[0].nome).toBe('Mercado')
  })

  it('bloqueia acesso sem token e valida dados', async () => {
    expect((await request(app).get('/api/transactions')).status).toBe(401)
    const login = await request(app).post('/api/auth/login').send({ email: 'pai@teste.com', senha: 'errada' })
    expect(login.status).toBe(401)
  })
})
