import {
  Category, CategoryTotal, DayTotal, MonthTotal, NewTransaction, Transaction,
  Settings, TransactionFilters, User,
} from '../types'

export interface UserRepository {
  create(data: Omit<User, 'id' | 'createdAt'>): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
}

export interface CategoryRepository {
  create(data: Omit<Category, 'id'>): Promise<Category>
  findByUser(userId: string): Promise<Category[]>
  findById(id: string): Promise<Category | null>
  update(id: string, data: Partial<Pick<Category, 'nome' | 'tipo' | 'cor'>>): Promise<Category>
  delete(id: string): Promise<void>
}

export interface TransactionRepository {
  create(data: NewTransaction): Promise<Transaction>
  findById(id: string): Promise<Transaction | null>
  findByUser(userId: string, filters?: TransactionFilters): Promise<Transaction[]>
  update(id: string, data: Partial<NewTransaction>): Promise<Transaction>
  delete(id: string): Promise<void>
  totalsByCategory(userId: string, month: string, tipo: 'receita' | 'despesa'): Promise<CategoryTotal[]>
  totalsByMonth(userId: string, year: string): Promise<MonthTotal[]>
  totalsByDay(userId: string, month: string): Promise<DayTotal[]>
  countByCategory(categoryId: string): Promise<number>
}

export interface SettingsRepository {
  get(userId: string): Promise<Settings>
  save(userId: string, data: Settings): Promise<Settings>
}

export interface Repositories {
  users: UserRepository
  categories: CategoryRepository
  transactions: TransactionRepository
  settings: SettingsRepository
}