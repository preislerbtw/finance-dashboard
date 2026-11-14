export type TransactionType = 'receita' | 'despesa'

export interface Category {
  id: string
  nome: string
  tipo: TransactionType
  cor: string
}

export interface Transaction {
  id: string
  categoryId: string
  tipo: TransactionType
  valorCentavos: number
  data: string // YYYY-MM-DD
  descricao: string
  pago: boolean
}

export interface CategoryTotal {
  categoryId: string
  total: number
  nome: string
  cor: string
}

export interface Summary {
  month: string
  totalReceitasCentavos: number
  totalDespesasCentavos: number
  saldoCentavos: number
  despesasPorCategoria: CategoryTotal[]
  receitasPorCategoria: CategoryTotal[]
}

export interface MonthPoint {
  mes: number
  receitasCentavos: number
  despesasCentavos: number
}

export interface DayPoint {
  dia: number
  despesasCentavos: number
}