import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import TransactionModal from '../components/TransactionModal'
import { api } from '../lib/api'
import { brl, currentMonth, formatDate } from '../lib/format'
import { Category, Transaction } from '../lib/types'
import { useFetch } from '../lib/useFetch'

export default function Transacoes() {
  const [month, setMonth] = useState(currentMonth())
  const [busca, setBusca] = useState('')
  const [q, setQ] = useState('') // busca com atraso (debounce)
  const [modal, setModal] = useState<{ item: Transaction | null } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setQ(busca.trim()), 300)
    return () => clearTimeout(timer)
  }, [busca])

  const categories = useFetch<Category[]>('/categories')
  const list = useFetch<Transaction[]>(`/transactions?month=${month}${q ? `&q=${encodeURIComponent(q)}` : ''}`)

  const catById = useMemo(() => new Map((categories.data ?? []).map((c) => [c.id, c])), [categories.data])
  const items = list.data ?? []
  const receitas = items.filter((t) => t.tipo === 'receita').reduce((s, t) => s + t.valorCentavos, 0)
  const despesas = items.filter((t) => t.tipo === 'despesa').reduce((s, t) => s + t.valorCentavos, 0)

  async function togglePago(t: Transaction) {
    await api(`/transactions/${t.id}`, { method: 'PUT', body: { pago: !t.pago } })
    list.reload()
  }

  async function remove(t: Transaction) {
    if (!confirm(`Excluir "${t.descricao || 'lançamento'}" de ${brl(t.valorCentavos)}?`)) return
    await api(`/transactions/${t.id}`, { method: 'DELETE' })
    list.reload()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950">Transações</h1>
          <p className="text-sm text-neutral-500">Anote e acompanhe cada gasto e receita</p>
        </div>
        <button
          onClick={() => setModal({ item: null })}
          disabled={!categories.data?.length}
          className="flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          <Plus size={18} /> Novo lançamento
        </button>
      </header>

      <div className="flex flex-wrap gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orange-500"
        />
        <div className="relative min-w-48 flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">Receitas</p>
          <p className="text-xl font-semibold">{brl(receitas)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">Despesas</p>
          <p className="text-xl font-semibold">{brl(despesas)}</p>
        </div>
        <div className="rounded-2xl bg-neutral-950 p-4 text-white">
          <p className="text-xs text-neutral-400">Saldo</p>
          <p className="text-xl font-semibold">{brl(receitas - despesas)}</p>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-2 shadow-sm sm:p-4">
        {list.error && <p className="p-4 text-sm text-red-600">{list.error}</p>}
        {!list.error && !list.loading && items.length === 0 && (
          <p className="p-8 text-center text-sm text-neutral-500">
            Nenhum lançamento neste período. Clique em “Novo lançamento” para começar.
          </p>
        )}
        <ul className="divide-y divide-neutral-100">
          {items.map((t) => {
            const cat = catById.get(t.categoryId)
            return (
              <li key={t.id} className="flex items-center gap-3 px-2 py-3">
                <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: cat?.cor ?? '#d4d4d4' }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{t.descricao || cat?.nome || 'Sem descrição'}</p>
                  <p className="text-xs text-neutral-500">{cat?.nome} · {formatDate(t.data)}</p>
                </div>
                <button
                  onClick={() => togglePago(t)}
                  title="Clique para alternar"
                  className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:block ${
                    t.pago ? 'bg-neutral-100 text-neutral-600' : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {t.pago ? 'Pago' : 'Pendente'}
                </button>
                <span className={`w-28 text-right text-sm font-semibold ${t.tipo === 'receita' ? 'text-orange-600' : 'text-neutral-950'}`}>
                  {t.tipo === 'receita' ? '+' : '-'} {brl(t.valorCentavos)}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setModal({ item: t })} aria-label="Editar" className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove(t)} aria-label="Excluir" className="rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {modal && categories.data && (
        <TransactionModal
          categories={categories.data}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            list.reload()
          }}
        />
      )}
    </div>
  )
}