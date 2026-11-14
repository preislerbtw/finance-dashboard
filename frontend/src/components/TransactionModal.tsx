import { X } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { api } from '../lib/api'
import { fromCentavos, toCentavos, today } from '../lib/format'
import { Category, Transaction, TransactionType } from '../lib/types'
import { ErrorMessage } from './AuthLayout'

interface Props {
  categories: Category[]
  initial: Transaction | null
  onClose: () => void
  onSaved: () => void
}

export default function TransactionModal({ categories, initial, onClose, onSaved }: Props) {
  const [tipo, setTipo] = useState<TransactionType>(initial?.tipo ?? 'despesa')
  const [valor, setValor] = useState(initial ? fromCentavos(initial.valorCentavos) : '')
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories.find((c) => c.tipo === 'despesa')?.id ?? '',
  )
  const [data, setData] = useState(initial?.data ?? today())
  const [descricao, setDescricao] = useState(initial?.descricao ?? '')
  const [pago, setPago] = useState(initial?.pago ?? true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const options = categories.filter((c) => c.tipo === tipo)

  function changeTipo(novo: TransactionType) {
    setTipo(novo)
    setCategoryId(categories.find((c) => c.tipo === novo)?.id ?? '')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const valorCentavos = toCentavos(valor)
    if (!(valorCentavos > 0)) return setError('Informe um valor maior que zero')
    if (!categoryId) return setError('Escolha uma categoria')

    setLoading(true)
    try {
      const body = { tipo, valorCentavos, categoryId, data, descricao, pago }
      if (initial) await api(`/transactions/${initial.id}`, { method: 'PUT', body })
      else await api('/transactions', { method: 'POST', body })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  const input =
    'w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? 'Editar lançamento' : 'Novo lançamento'}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
          {(['despesa', 'receita'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeTipo(t)}
              className={`rounded-lg py-2 text-sm font-medium capitalize transition ${
                tipo === t ? 'bg-neutral-950 text-white' : 'text-neutral-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Valor (R$)</span>
          <input
            className={input}
            inputMode="decimal"
            placeholder="0,00"
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">Categoria</span>
          <select className={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {options.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Data</span>
            <input className={input} type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">Descrição</span>
            <input className={input} placeholder="Ex.: Mercado" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={pago} onChange={(e) => setPago(e.target.checked)} className="h-4 w-4 accent-orange-500" />
          Já foi pago
        </label>

        <ErrorMessage message={error} />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-neutral-950 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}