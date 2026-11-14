import { randomUUID } from 'node:crypto'
import {
  CategoryRepository, Repositories, TransactionRepository, UserRepository,
} from '../interfaces'
import { Category, Transaction, User } from '../../types'

class InMemoryUserRepository implements UserRepository {
  private items: User[] = []

  async create(data: Omit<User, 'id' | 'createdAt'>) {
    const user: User = { ...data, id: randomUUID(), createdAt: new Date().toISOString() }
    this.items.push(user)
    return user
  }
  async findByEmail(email: string) {
    return this.items.find((u) => u.email === email) ?? null
  }
  async findById(id: string) {
    return this.items.find((u) => u.id === id) ?? null
  }
}

class InMemoryCategoryRepository implements CategoryRepository {
  private items: Category[] = []

  async create(data: Omit<Category, 'id'>) {
    const category: Category = { ...data, id: randomUUID() }
    this.items.push(category)
    return category
  }
  async findByUser(userId: string) {
    return this.items.filter((c) => c.userId === userId)
  }
  async findById(id: string) {
    return this.items.find((c) => c.id === id) ?? null
  }
}

class InMemoryTransactionRepository implements TransactionRepository {
  private items: Transaction[] = []

  async create(data: Omit<Transaction, 'id' | 'createdAt'>) {
    const t: Transaction = { ...data, id: randomUUID(), createdAt: new Date().toISOString() }
    this.items.push(t)
    return t
  }
  async findById(id: string) {
    return this.items.find((t) => t.id === id) ?? null
  }
  async findByUser(userId: string, filters: { month?: string; categoryId?: string; q?: string } = {}) {
    const q = filters.q?.toLowerCase()
    return this.items
      .filter((t) => t.userId === userId)
      .filter((t) => !filters.month || t.data.startsWith(filters.month))
      .filter((t) => !filters.categoryId || t.categoryId === filters.categoryId)
      .filter((t) => !q || t.descricao.toLowerCase().includes(q))
      .sort((a, b) => b.data.localeCompare(a.data))
  }
  async update(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) {
    const index = this.items.findIndex((t) => t.id === id)
    this.items[index] = { ...this.items[index], ...data }
    return this.items[index]
  }
  async delete(id: string) {
    this.items = this.items.filter((t) => t.id !== id)
  }
  async totalsByCategory(userId: string, month: string, tipo: 'receita' | 'despesa') {
    const totals = new Map<string, number>()
    for (const t of this.items) {
      if (t.userId === userId && t.tipo === tipo && t.data.startsWith(month)) {
        totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.valorCentavos)
      }
    }
    return [...totals].map(([categoryId, total]) => ({ categoryId, total })).sort((a, b) => b.total - a.total)
  }
  async totalsByMonth(userId: string, year: string) {
    const totals = new Map<number, { receitas: number; despesas: number }>()
    for (const t of this.items) {
      if (t.userId !== userId || !t.data.startsWith(year)) continue
      const month = Number(t.data.slice(5, 7))
      const entry = totals.get(month) ?? { receitas: 0, despesas: 0 }
      if (t.tipo === 'receita') entry.receitas += t.valorCentavos
      else entry.despesas += t.valorCentavos
      totals.set(month, entry)
    }
    return [...totals].map(([month, v]) => ({ month, ...v }))
  }
  async totalsByDay(userId: string, month: string) {
    const totals = new Map<number, number>()
    for (const t of this.items) {
      if (t.userId === userId && t.tipo === 'despesa' && t.data.startsWith(month)) {
        const day = Number(t.data.slice(8, 10))
        totals.set(day, (totals.get(day) ?? 0) + t.valorCentavos)
      }
    }
    return [...totals].map(([day, despesas]) => ({ day, despesas }))
  }
}

export function createInMemoryRepositories(): Repositories {
  return {
    users: new InMemoryUserRepository(),
    categories: new InMemoryCategoryRepository(),
    transactions: new InMemoryTransactionRepository(),
  }
}