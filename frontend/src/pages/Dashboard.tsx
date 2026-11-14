import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'
import { ReactNode, useMemo } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { brl, brlShort, currentMonth, formatDate } from '../lib/format'
import { Category, DayPoint, MonthPoint, Summary, Transaction } from '../lib/types'
import { useFetch } from '../lib/useFetch'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const LIMITE_MENSAL = 400000 // R$ 4.000,00 (por enquanto fixo; depois vira configuração)

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

function Card({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl bg-white p-5 shadow-sm ${className}`}>
      <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function StatCard({ label, value, icon, highlight = false }: { label: string; value: string; icon: ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-3xl p-5 ${highlight ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : 'bg-white shadow-sm'}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${highlight ? 'text-orange-50' : 'text-neutral-500'}`}>{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${highlight ? 'bg-white/20' : 'bg-neutral-100 text-neutral-700'}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const month = currentMonth()
  const year = month.slice(0, 4)

  const summary = useFetch<Summary>(`/dashboard/summary?month=${month}`).data
  const monthlyRaw = useFetch<MonthPoint[]>(`/dashboard/monthly?year=${year}`).data
  const dailyRaw = useFetch<DayPoint[]>(`/dashboard/daily?month=${month}`).data
  const recentRaw = useFetch<Transaction[]>(`/transactions?month=${month}`).data
  const categories = useFetch<Category[]>('/categories').data

  const monthly = useMemo(
    () => (monthlyRaw ?? []).map((m) => ({ mes: MESES[m.mes - 1], despesas: m.despesasCentavos, receitas: m.receitasCentavos })),
    [monthlyRaw],
  )
  const daily = useMemo(() => {
    const hoje = new Date().getDate() // só até hoje, para não desenhar dias futuros
    return (dailyRaw ?? []).filter((d) => d.dia <= hoje).map((d) => ({ dia: String(d.dia).padStart(2, '0'), valor: d.despesasCentavos }))
  }, [dailyRaw])
  const catById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories])

  const despesas = summary?.totalDespesasCentavos ?? 0
  const receitas = summary?.totalReceitasCentavos ?? 0
  const porCategoria = summary?.despesasPorCategoria ?? []
  const totalCat = porCategoria.reduce((s, c) => s + c.total, 0)
  const pctLimite = Math.min(100, Math.round((despesas / LIMITE_MENSAL) * 100))
  const recent = (recentRaw ?? []).slice(0, 5)

  const firstName = user?.nome.split(' ')[0]
  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="mb-2">
        <h1 className="text-3xl font-semibold text-neutral-950">
          {greeting()}, {firstName}
        </h1>
        <p className="text-sm capitalize text-neutral-500">Resumo de {mesAtual}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard highlight label="Despesas do mês" value={brl(despesas)} icon={<ArrowDownRight size={18} />} />
        <StatCard label="Receitas do mês" value={brl(receitas)} icon={<ArrowUpRight size={18} />} />
        <StatCard label="Saldo" value={brl(receitas - despesas)} icon={<Wallet size={18} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Gasto por mês" subtitle={`Despesas e receitas de ${year}`} className="lg:col-span-3">
          <div className="mb-2 flex gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-neutral-950" /> Despesas</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-orange-500" /> Receitas</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} barGap={4}>
                <defs>
                  <pattern id="stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill="#FDBA74" />
                    <rect width="3" height="6" fill="#F97316" />
                  </pattern>
                </defs>
                <CartesianGrid vertical={false} stroke="#EEE" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                <YAxis axisLine={false} tickLine={false} width={36} tickFormatter={brlShort} tick={{ fontSize: 12, fill: '#737373' }} />
                <Tooltip cursor={{ fill: '#F5F5F4' }} formatter={(v) => brl(Number(v))} />
                <Bar dataKey="despesas" name="Despesas" fill="#111111" radius={[6, 6, 0, 0]} />
                <Bar dataKey="receitas" name="Receitas" fill="url(#stripes)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Por categoria" subtitle="Onde o dinheiro foi neste mês" className="lg:col-span-2">
          {porCategoria.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhuma despesa neste mês ainda.</p>
          ) : (
            <ul className="space-y-4">
              {porCategoria.map((c) => (
                <li key={c.categoryId}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-neutral-800">{c.nome}</span>
                    <span className="text-neutral-500">{brl(c.total)}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-neutral-100">
                    <div className="h-2 rounded-full" style={{ width: `${(c.total / totalCat) * 100}%`, background: c.cor }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Evolução do mês" subtitle="Gasto de cada dia, dos pequenos aos grandes" className="lg:col-span-3">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EEE" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#737373' }} />
                <YAxis axisLine={false} tickLine={false} width={36} tickFormatter={brlShort} tick={{ fontSize: 12, fill: '#737373' }} />
                <Tooltip formatter={(v) => brl(Number(v))} labelFormatter={(d) => `Dia ${d}`} />
                <Area type="monotone" dataKey="valor" name="Gasto" stroke="#F97316" strokeWidth={2.5} fill="url(#fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Limite mensal" subtitle={`${brl(despesas)} de ${brl(LIMITE_MENSAL)}`} className="lg:col-span-2">
          <p className="text-4xl font-semibold tracking-tight">{pctLimite}%</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-3 rounded-full bg-orange-500" style={{ width: `${pctLimite}%` }} />
          </div>
          <p className="mt-3 text-sm text-neutral-500">
            {despesas <= LIMITE_MENSAL
              ? `Restam ${brl(LIMITE_MENSAL - despesas)} para gastar neste mês.`
              : `Você passou ${brl(despesas - LIMITE_MENSAL)} do limite.`}
          </p>
        </Card>
      </div>

      <Card title="Últimos lançamentos">
        {recent.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Nada por aqui ainda.{' '}
            <Link to="/transacoes" className="font-medium text-orange-600 hover:underline">Anote o primeiro lançamento</Link>.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">{t.descricao || catById.get(t.categoryId)?.nome}</p>
                  <p className="text-xs text-neutral-500">{catById.get(t.categoryId)?.nome} · {formatDate(t.data)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.pago ? 'bg-neutral-100 text-neutral-600' : 'bg-orange-100 text-orange-700'}`}>
                    {t.pago ? 'Pago' : 'Pendente'}
                  </span>
                  <span className={`w-28 text-right text-sm font-semibold ${t.tipo === 'receita' ? 'text-orange-600' : 'text-neutral-950'}`}>
                    {t.tipo === 'receita' ? '+' : '-'} {brl(t.valorCentavos)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}