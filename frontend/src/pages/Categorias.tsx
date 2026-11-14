import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { ErrorMessage } from '../components/AuthLayout'
import { api } from '../lib/api'
import { Category, TransactionType } from '../lib/types'
import { useFetch } from '../lib/useFetch'

const CORES = ['#111111', '#F97316', '#FB923C', '#FDBA74', '#EF4444', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280']

function CategoryModal({ initial, onClose, onSaved }: { initial: Category | null; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(initial?.nome ?? '')
  const [tipo, setTipo] = useState<TransactionType>(initial?.tipo ?? 'despesa')
  const [cor, setCor] = useState(initial?.cor ?? CORES[1])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return setError('Dê um nome para a categoria')
    setLoading(true)
    setError('')
    try {
      const body = { nome: nome.trim(), tipo, cor }
      if (initial) await api(`/categories/${initial.id}`, { method: 'PUT', body })
      else await api('/categories', { method: 'POST', body })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm space-y-4 rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? 'Editar categoria' : 'Nova categoria'}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100">
            <X size={18} />
          </button>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Nome</span>
          <input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Farmácia"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </label>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
          {(['despesa', 'receita'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`rounded-lg py-2 text-sm font-medium capitalize transition ${tipo === t ? 'bg-neutral-950 text-white' : 'text-neutral-600'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-neutral-700">Cor</span>
          <div className="flex flex-wrap gap-2">
            {CORES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCor(c)}
                aria-label={`Cor ${c}`}
                className={`h-8 w-8 rounded-full border-2 transition ${cor === c ? 'scale-110 border-neutral-950' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <ErrorMessage message={error} />
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-neutral-950 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60">
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}

export default function Categorias() {
  const { data, error, reload } = useFetch<Category[]>('/categories')
  const [modal, setModal] = useState<{ item: Category | null } | null>(null)
  const [actionError, setActionError] = useState('')

  async function remove(c: Category) {
    if (!confirm(`Excluir a categoria "${c.nome}"?`)) return
    setActionError('')
    try {
      await api(`/categories/${c.id}`, { method: 'DELETE' })
      reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  const grupos: { titulo: string; tipo: TransactionType }[] = [
    { titulo: 'Despesas', tipo: 'despesa' },
    { titulo: 'Receitas', tipo: 'receita' },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950">Categorias</h1>
          <p className="text-sm text-neutral-500">Organize seus lançamentos do seu jeito</p>
        </div>
        <button onClick={() => setModal({ item: null })} className="flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800">
          <Plus size={18} /> Nova categoria
        </button>
      </header>

      {(error || actionError) && <ErrorMessage message={actionError || error} />}

      {grupos.map(({ titulo, tipo }) => (
        <section key={tipo} className="rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="px-2 pb-2 text-sm font-semibold text-neutral-500">{titulo}</h2>
          <ul className="divide-y divide-neutral-100">
            {(data ?? []).filter((c) => c.tipo === tipo).map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-2 py-3">
                <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: c.cor }} />
                <span className="flex-1 text-sm font-medium text-neutral-900">{c.nome}</span>
                <button onClick={() => setModal({ item: c })} aria-label="Editar" className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(c)} aria-label="Excluir" className="rounded-full p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
          {data && data.filter((c) => c.tipo === tipo).length === 0 && (
            <p className="px-2 py-3 text-sm text-neutral-500">Nenhuma categoria de {titulo.toLowerCase()}.</p>
          )}
        </section>
      ))}

      {modal && (
        <CategoryModal
          initial={modal.item}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            reload()
          }}
        />
      )}
    </div>
  )
}