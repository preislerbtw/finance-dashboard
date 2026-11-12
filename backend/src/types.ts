export type TransactionType = 'receita' | 'despesa'

export interface User {
  id: string
  nome: string
  email: string
  senhaHash: string
  createdAt: string
}

export interface Category {
  id: string
  userId: string
  nome: string
  tipo: TransactionType
  cor: string
}

// valores sempre em centavos (inteiro) 
// datas no formato YYYY-MM-DD.
export interface Transaction {
  id: string
  userId: string
  categoryId: string
  tipo: TransactionType
  valorCentavos: number
  data: string
  descricao: string
  pago: boolean
  createdAt: string
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>

export interface TransactionFilters {
  month?: string // YYYY-MM
  categoryId?: string
  q?: string
}

export interface CategoryTotal {
  categoryId: string
  total: number
}
