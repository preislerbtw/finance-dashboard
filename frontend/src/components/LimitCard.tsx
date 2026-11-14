import { Pencil } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { api } from '../lib/api'
import { brl, fromCentavos, toCentavos } from '../lib/format'
import { useFetch } from '../lib/useFetch'

interface Settings {
  limiteMensalCentavos: number
}

export default function LimitCard({ despesas, className = '' }: { despesas: number; className?: string }) {
  const settings = useFetch<Settings>('/settings')
  const [editing, setEditing] = useState(false)
  const [valor, setValor] = useState('')
  const [error, setError] = useState('')

  const limite = settings.data?.limiteMensalCentavos ?? 0
  const pct = limite > 0 ? Math.min(100, Math.round((despesas / limite) * 100)) : 0

  function startEdit() {
    setValor(limite > 0 ? fromCentavos(limite) : '')
    setError('')
    setEditing(true)
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    const centavos = valor.trim() === '' ? 0 : toCentavos(valor)
    if (Number.isNaN(centavos) || centavos < 0) return setError('Valor inválido')
    await api('/settings', { method: 'PUT', body: { limiteMensalCentavos: centavos } })
    setEditing(false)
    settings.reload()
  }

  return (
    <section className={`rounded-3xl bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-950">Limite mensal</h2>
          <p className="text-sm text-neutral-500">
            {limite > 0 ? `${brl(despesas)} de ${brl(limite)}` : 'Defina quanto quer gastar por mês'}
          </p>
        </div>
        {!editing && (
          <button onClick={startEdit} aria-label="Editar limite" className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900">
            <Pencil size={16} />
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} className="mt-4 space-y-3">
          <input
            autoFocus
            inputMode="decimal"
            placeholder="Ex.: 4.000,00 (vazio = sem limite)"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-xl bg-neutral-950 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              Salvar
            </button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50">
              Cancelar
            </button>
          </div>
        </form>
      ) : limite > 0 ? (
        <div className="mt-4">
          <p className="text-4xl font-semibold tracking-tight">{pct}%</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-3 rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-sm text-neutral-500">
            {despesas <= limite ? `Restam ${brl(limite - despesas)} para gastar neste mês.` : `Você passou ${brl(despesas - limite)} do limite.`}
          </p>
        </div>
      ) : (
        <button onClick={startEdit} className="mt-4 w-full rounded-xl border border-dashed border-orange-400 bg-orange-50 py-3 text-sm font-medium text-orange-700 hover:bg-orange-100">
          Definir limite mensal
        </button>
      )}
    </section>
  )
}