import { Pool } from 'pg'
import {
  CategoryRepository, Repositories, SettingsRepository, TransactionRepository, UserRepository,
} from '../interfaces'
import {
  Category, CategoryTotal, DayTotal, MonthTotal, NewTransaction, Settings,
  Transaction, TransactionFilters, User,
} from '../../types'

const toIso = (d: Date | string) => (d instanceof Date ? d.toISOString() : d)

const mapUser = (r: any): User => ({
  id: r.id, nome: r.nome, email: r.email, senhaHash: r.senha_hash, createdAt: toIso(r.created_at),
})
const mapCategory = (r: any): Category => ({
  id: r.id, userId: r.user_id, nome: r.nome, tipo: r.tipo, cor: r.cor,
})
const mapTransaction = (r: any): Transaction => ({
  id: r.id, userId: r.user_id, categoryId: r.category_id, tipo: r.tipo,
  valorCentavos: r.valor_centavos, data: r.data, descricao: r.descricao,
  pago: r.pago, createdAt: toIso(r.created_at),
})

// monta "SET col = $n, ..." só com os campos enviados (ignora undefined)
function buildSet(data: Record<string, unknown>, columns: Record<string, string>, startAt = 2) {
  const sets: string[] = []
  const values: unknown[] = []
  for (const [key, column] of Object.entries(columns)) {
    if (data[key] !== undefined) {
      values.push(data[key])
      sets.push(`${column} = $${startAt + values.length - 1}`)
    }
  }
  return { sets, values }
}

class PgUserRepository implements UserRepository {
  constructor(private db: Pool) {}

  async create(data: Omit<User, 'id' | 'createdAt'>) {
    const { rows } = await this.db.query(
      'INSERT INTO users (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING *',
      [data.nome, data.email, data.senhaHash],
    )
    return mapUser(rows[0])
  }
  async findByEmail(email: string) {
    const { rows } = await this.db.query('SELECT * FROM users WHERE email = $1', [email])
    return rows[0] ? mapUser(rows[0]) : null
  }
  async findById(id: string) {
    const { rows } = await this.db.query('SELECT * FROM users WHERE id = $1', [id])
    return rows[0] ? mapUser(rows[0]) : null
  }
}

class PgCategoryRepository implements CategoryRepository {
  constructor(private db: Pool) {}

  async create(data: Omit<Category, 'id'>) {
    const { rows } = await this.db.query(
      'INSERT INTO categories (user_id, nome, tipo, cor) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.userId, data.nome, data.tipo, data.cor],
    )
    return mapCategory(rows[0])
  }
  async findByUser(userId: string) {
    const { rows } = await this.db.query('SELECT * FROM categories WHERE user_id = $1 ORDER BY nome', [userId])
    return rows.map(mapCategory)
  }
  async findById(id: string) {
    const { rows } = await this.db.query('SELECT * FROM categories WHERE id = $1', [id])
    return rows[0] ? mapCategory(rows[0]) : null
  }
  async update(id: string, data: Partial<Pick<Category, 'nome' | 'tipo' | 'cor'>>) {
    const { sets, values } = buildSet(data, { nome: 'nome', tipo: 'tipo', cor: 'cor' })
    if (sets.length === 0) return (await this.findById(id))!
    const { rows } = await this.db.query(
      `UPDATE categories SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values],
    )
    return mapCategory(rows[0])
  }
  async delete(id: string) {
    await this.db.query('DELETE FROM categories WHERE id = $1', [id])
  }
}

class PgTransactionRepository implements TransactionRepository {
  constructor(private db: Pool) {}

  async create(data: NewTransaction) {
    const { rows } = await this.db.query(
      `INSERT INTO transactions (user_id, category_id, tipo, valor_centavos, data, descricao, pago)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.userId, data.categoryId, data.tipo, data.valorCentavos, data.data, data.descricao ?? '', data.pago ?? true],
    )
    return mapTransaction(rows[0])
  }
  async findById(id: string) {
    const { rows } = await this.db.query('SELECT * FROM transactions WHERE id = $1', [id])
    return rows[0] ? mapTransaction(rows[0]) : null
  }
  async findByUser(userId: string, filters: TransactionFilters = {}) {
    const where = ['user_id = $1']
    const params: unknown[] = [userId]

    if (filters.month) {
      params.push(`${filters.month}-01`)
      where.push(`data >= $${params.length}::date AND data < ($${params.length}::date + interval '1 month')`)
    }
    if (filters.categoryId) {
      params.push(filters.categoryId)
      where.push(`category_id = $${params.length}`)
    }
    if (filters.q) {
      params.push(`%${filters.q.replace(/[\\%_]/g, '\\$&')}%`)
      where.push(`descricao ILIKE $${params.length}`)
    }

    const { rows } = await this.db.query(
      `SELECT * FROM transactions WHERE ${where.join(' AND ')} ORDER BY data DESC, created_at DESC`,
      params,
    )
    return rows.map(mapTransaction)
  }
  async update(id: string, data: Partial<NewTransaction>) {
    const { sets, values } = buildSet(data, {
      categoryId: 'category_id', tipo: 'tipo', valorCentavos: 'valor_centavos',
      data: 'data', descricao: 'descricao', pago: 'pago',
    })
    if (sets.length === 0) return (await this.findById(id))!
    const { rows } = await this.db.query(
      `UPDATE transactions SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
      [id, ...values],
    )
    return mapTransaction(rows[0])
  }
  async delete(id: string) {
    await this.db.query('DELETE FROM transactions WHERE id = $1', [id])
  }
  async totalsByCategory(userId: string, month: string, tipo: 'receita' | 'despesa'): Promise<CategoryTotal[]> {
    const { rows } = await this.db.query(
      `SELECT category_id, SUM(valor_centavos)::int AS total
       FROM transactions
       WHERE user_id = $1 AND tipo = $2
         AND data >= $3::date AND data < ($3::date + interval '1 month')
       GROUP BY category_id
       ORDER BY total DESC`,
      [userId, tipo, `${month}-01`],
    )
    return rows.map((r) => ({ categoryId: r.category_id, total: r.total }))
  }
  async totalsByMonth(userId: string, year: string): Promise<MonthTotal[]> {
    const { rows } = await this.db.query(
      `SELECT EXTRACT(MONTH FROM data)::int AS month,
              COALESCE(SUM(valor_centavos) FILTER (WHERE tipo = 'receita'), 0)::int AS receitas,
              COALESCE(SUM(valor_centavos) FILTER (WHERE tipo = 'despesa'), 0)::int AS despesas
       FROM transactions
       WHERE user_id = $1 AND data >= $2::date AND data < ($2::date + interval '1 year')
       GROUP BY 1
       ORDER BY 1`,
      [userId, `${year}-01-01`],
    )
    return rows.map((r) => ({ month: r.month, receitas: r.receitas, despesas: r.despesas }))
  }
  async totalsByDay(userId: string, month: string): Promise<DayTotal[]> {
    const { rows } = await this.db.query(
      `SELECT EXTRACT(DAY FROM data)::int AS day, SUM(valor_centavos)::int AS despesas
       FROM transactions
       WHERE user_id = $1 AND tipo = 'despesa'
         AND data >= $2::date AND data < ($2::date + interval '1 month')
       GROUP BY 1
       ORDER BY 1`,
      [userId, `${month}-01`],
    )
    return rows.map((r) => ({ day: r.day, despesas: r.despesas }))
  }
  async countByCategory(categoryId: string) {
    const { rows } = await this.db.query(
      'SELECT COUNT(*)::int AS n FROM transactions WHERE category_id = $1',
      [categoryId],
    )
    return rows[0].n as number
  }
}

class PgSettingsRepository implements SettingsRepository {
  constructor(private db: Pool) {}

  async get(userId: string): Promise<Settings> {
    const { rows } = await this.db.query('SELECT limite_mensal_centavos FROM settings WHERE user_id = $1', [userId])
    return { limiteMensalCentavos: rows[0]?.limite_mensal_centavos ?? 0 }
  }
  async save(userId: string, data: Settings): Promise<Settings> {
    const { rows } = await this.db.query(
      `INSERT INTO settings (user_id, limite_mensal_centavos) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET limite_mensal_centavos = EXCLUDED.limite_mensal_centavos
       RETURNING limite_mensal_centavos`,
      [userId, data.limiteMensalCentavos],
    )
    return { limiteMensalCentavos: rows[0].limite_mensal_centavos }
  }
}

export function createPostgresRepositories(db: Pool): Repositories {
  return {
    users: new PgUserRepository(db),
    categories: new PgCategoryRepository(db),
    transactions: new PgTransactionRepository(db),
    settings: new PgSettingsRepository(db),
  }
}