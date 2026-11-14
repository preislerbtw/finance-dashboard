import { AppError } from '../errors'
import { Repositories } from '../repositories/interfaces'
import { NewTransaction, TransactionFilters } from '../types'

export class TransactionService {
  constructor(private repos: Repositories) {}

  private async assertCategory(userId: string, categoryId: string) {
    const category = await this.repos.categories.findById(categoryId)
    if (!category || category.userId !== userId) throw new AppError(400, 'Categoria inválida')
  }

  private async getOwned(userId: string, id: string) {
    const t = await this.repos.transactions.findById(id)
    if (!t || t.userId !== userId) throw new AppError(404, 'Transação não encontrada')
    return t
  }

  async create(userId: string, data: Omit<NewTransaction, 'userId'>) {
    await this.assertCategory(userId, data.categoryId)
    return this.repos.transactions.create({ ...data, userId })
  }

  list(userId: string, filters: TransactionFilters) {
    return this.repos.transactions.findByUser(userId, filters)
  }

  async update(userId: string, id: string, data: Partial<Omit<NewTransaction, 'userId'>>) {
    await this.getOwned(userId, id)
    if (data.categoryId) await this.assertCategory(userId, data.categoryId)
    return this.repos.transactions.update(id, data)
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id)
    await this.repos.transactions.delete(id)
  }

  async summary(userId: string, month: string) {
    const [receitas, despesas, categories] = await Promise.all([
      this.repos.transactions.totalsByCategory(userId, month, 'receita'),
      this.repos.transactions.totalsByCategory(userId, month, 'despesa'),
      this.repos.categories.findByUser(userId),
    ])
    const nomes = new Map(categories.map((c) => [c.id, c]))
    const withName = (list: { categoryId: string; total: number }[]) =>
      list.map((i) => ({
        ...i,
        nome: nomes.get(i.categoryId)?.nome ?? 'Sem categoria',
        cor: nomes.get(i.categoryId)?.cor ?? '#6b7280',
      }))

    const totalReceitas = receitas.reduce((s, i) => s + i.total, 0)
    const totalDespesas = despesas.reduce((s, i) => s + i.total, 0)
    return {
      month,
      totalReceitasCentavos: totalReceitas,
      totalDespesasCentavos: totalDespesas,
      saldoCentavos: totalReceitas - totalDespesas,
      despesasPorCategoria: withName(despesas),
      receitasPorCategoria: withName(receitas),
    }
  }

  // Receitas e despesas de cada mês do ano (sempre 12 itens)
  async monthly(userId: string, year: string) {
    const rows = await this.repos.transactions.totalsByMonth(userId, year)
    return Array.from({ length: 12 }, (_, i) => {
      const row = rows.find((r) => r.month === i + 1)
      return { mes: i + 1, receitasCentavos: row?.receitas ?? 0, despesasCentavos: row?.despesas ?? 0 }
    })
  }

  // Despesa de cada dia do mês (um item por dia, mesmo sem gasto)
  async daily(userId: string, month: string) {
    const [year, m] = month.split('-').map(Number)
    const rows = await this.repos.transactions.totalsByDay(userId, month)
    return Array.from({ length: new Date(year, m, 0).getDate() }, (_, i) => ({
      dia: i + 1,
      despesasCentavos: rows.find((r) => r.day === i + 1)?.despesas ?? 0,
    }))
  }
}