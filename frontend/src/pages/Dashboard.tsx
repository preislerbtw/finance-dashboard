import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Wallet } from 'lucide-react'
import { ReactNode, useMemo, useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import LimitCard from '../components/LimitCard'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { brl, brlShort, currentMonth, formatDate, monthLabel, shiftMonth } from '../lib/format'
import { Category, DayPoint, MonthPoint, Summary, Transaction } from '../lib/types'
import { useFetch } from '../lib/useFetch'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

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
    <div className={`rounded-3xl p-5 ${highlight ? 'bg-linear-to-br from-orange-400 to-orange-600 text-white' : 'bg-white shadow-sm'}`}>
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
  const { theme } = useTheme()
  const [month, setMonth] = useState(currentMonth())
  const year = month.slice(0, 4)
  const isCurrent = month === currentMonth()

  // cores dos gráficos
  // obs: recharts nao le no css, entao temos que definir aqui mesmo
  const dark = theme === 'dark'
  const ink = dark ? '#fafafa' : '#111111'
  const grid = dark ? '#2a2a2e' : '#EEEEEE'
  const axis = dark ? '#a1a1aa' : '#737373'
  const tooltipStyle = {
    background: dark ? '#27272a' : '#ffffff',
    border: `1px solid ${dark ? '#3f3f46' : '#e5e5e5'}`,
    borderRadius: 12,
    color: ink,
  }

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
    const hoje = new Date().getDate()
    return (dailyRaw ?? [])
      .filter((d) => !isCurrent || d.dia <= hoje) // no mês atual, não desenha dias futuros
      .map((d) => ({ dia: String(d.dia).padStart(2, '0'), valor: d.despesasCentavos }))
  }, [dailyRaw, isCurrent])
  const catById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories])

  const despesas = summary?.totalDespesasCentavos ?? 0
  const receitas = summary?.totalReceitasCentavos ?? 0
  const porCategoria = summary?.despesasPorCategoria ?? []
  const totalCat = porCategoria.reduce((s, c) => s + c.total, 0)
  const recent = (recentRaw ?? []).slice(0, 5)

  const firstName = user?.nome.split(' ')[0]

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950">
            {greeting()}, {firstName}
          </h1>
          <p className="text-sm capitalize text-neutral-500">Resumo de {monthLabel(month)}</p>
          {!isCurrent && (
            <button onClick={() => setMonth(currentMonth())} className="mt-1 text-xs font-medium text-orange-600 hover:underline">
              Voltar ao mês atual
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm">
          <button
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label="Mês anterior"
            className="rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-36 text-center text-sm font-medium capitalize text-neutral-900">{monthLabel(month)}</span>
          <button
            onClick={() => setMonth(shiftMonth(month, 1))}
            disabled={isCurrent}
            aria-label="Próximo mês"
            className="rounded-full p-2 text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard highlight label="Despesas do mês" value={brl(despesas)} icon={<ArrowDownRight size={18} />} />
        <StatCard label="Receitas do mês" value={brl(receitas)} icon={<ArrowUpRight size={18} />} />
        <StatCard label="Saldo" value={brl(receitas - despesas)} icon={<Wallet size={18} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Gasto por mês" subtitle={`Despesas e receitas de ${year}`} className="lg:col-span-3">
          <div className="mb-2 flex gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: ink }} /> Despesas</span>
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
                <CartesianGrid vertical={false} stroke={grid} />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axis }} />
                <YAxis axisLine={false} tickLine={false} width={36} tickFormatter={brlShort} tick={{ fontSize: 12, fill: axis }} />
                <Tooltip
                  cursor={{ fill: dark ? '#27272a' : '#F5F5F4' }}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: ink }}
                  formatter={(v) => brl(Number(v))}
                />
                <Bar dataKey="despesas" name="Despesas" fill={ink} radius={[6, 6, 0, 0]} />
                <Bar dataKey="receitas" name="Receitas" fill="url(#stripes)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Por categoria" subtitle="Onde o dinheiro foi neste mês" className="lg:col-span-2">
          {porCategoria.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhuma despesa neste mês.</p>
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
                <CartesianGrid vertical={false} stroke={grid} />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axis }} />
                <YAxis axisLine={false} tickLine={false} width={36} tickFormatter={brlShort} tick={{ fontSize: 12, fill: axis }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: ink }}
                  formatter={(v) => brl(Number(v))}
                  labelFormatter={(d) => `Dia ${d}`}
                />
                <Area type="monotone" dataKey="valor" name="Gasto" stroke="#F97316" strokeWidth={2.5} fill="url(#fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <LimitCard despesas={despesas} className="lg:col-span-2" />
      </div>

      <Card title="Últimos lançamentos">
        {recent.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Nada por aqui.{' '}
            <Link to="/transacoes" className="font-medium text-orange-600 hover:underline">Ir para Transações</Link>.
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