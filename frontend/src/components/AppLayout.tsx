import { LayoutDashboard, LogOut, Receipt } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from './AuthLayout'

const links = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/transacoes', label: 'Transações', icon: Receipt, end: false },
]

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-4 left-4 hidden w-60 flex-col justify-between rounded-3xl bg-neutral-950 p-5 text-white lg:flex">
        <div>
          <Logo dark />
          <nav className="mt-10 space-y-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive ? 'bg-orange-500 font-medium text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="rounded-2xl bg-neutral-900 p-3">
          <p className="truncate text-sm font-medium">{user?.nome}</p>
          <p className="truncate text-xs text-neutral-500">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="px-4 pb-28 pt-6 lg:pb-10 lg:pl-72 lg:pr-6 lg:pt-8">
        <Outlet />
      </main>

      {/* Barra inferior (celular) */}
      <nav className="fixed inset-x-3 bottom-3 flex items-center justify-around rounded-2xl bg-neutral-950 p-2 text-white shadow-lg lg:hidden">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-xl px-5 py-1.5 text-[11px] ${
                isActive ? 'bg-orange-500 text-white' : 'text-neutral-400'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <button onClick={logout} className="flex flex-col items-center gap-0.5 px-5 py-1.5 text-[11px] text-neutral-400">
          <LogOut size={20} />
          Sair
        </button>
      </nav>
    </div>
  )
}