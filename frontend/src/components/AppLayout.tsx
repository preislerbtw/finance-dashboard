import { LayoutDashboard, LogOut, Moon, Receipt, Sun, Tags } from 'lucide-react'
import { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/transacoes', label: 'Transações', icon: Receipt, end: false },
  { to: '/categorias', label: 'Categorias', icon: Tags, end: false },
]

// Rótulo que aparece ao passar o mouse sobre um ícone
function Tip({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-full z-10 ml-3 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
      {children}
    </span>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen">
      {/* Sidebar (desktop): trilho de ícones */}
      <aside className="fixed inset-y-4 left-4 hidden w-16 flex-col justify-between lg:flex">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white">
              $
            </div>
          </div>

          <nav className="flex w-16 flex-col items-center gap-2 rounded-full bg-white p-2 shadow-sm">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={label}
                className={({ isActive }) =>
                  `group relative flex h-11 w-11 items-center justify-center rounded-full transition ${
                    isActive ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'
                  }`
                }
              >
                <Icon size={20} />
                <Tip>{label}</Tip>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex w-16 flex-col items-center gap-2 rounded-full bg-white p-2 shadow-sm">
          <ThemeToggle className="group relative h-11 w-11 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950">
            <Tip>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</Tip>
          </ThemeToggle>
          <div
            title={user?.nome}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700"
          >
            {user?.nome.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={logout}
            aria-label="Sair"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <LogOut size={20} />
            <Tip>Sair</Tip>
          </button>
        </div>
      </aside>

      {/* conteúdo */}
      <main className="px-4 pb-28 pt-6 lg:pb-10 lg:pl-28 lg:pr-6 lg:pt-8">
        <Outlet />
      </main>

      {/* barra inferior (celular) */}
      <nav className="fixed inset-x-3 bottom-[calc(0.75rem_+_env(safe-area-inset-bottom))] flex items-center justify-around rounded-2xl bg-neutral-950 p-2 text-white shadow-lg lg:hidden">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-xl px-3.5 py-1.5 text-[11px] ${
                isActive ? 'bg-orange-500 text-white' : 'text-neutral-400'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <button onClick={toggle} className="flex flex-col items-center gap-0.5 px-3.5 py-1.5 text-[11px] text-neutral-400">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          Tema
        </button>
        <button onClick={logout} className="flex flex-col items-center gap-0.5 px-3.5 py-1.5 text-[11px] text-neutral-400">
          <LogOut size={20} />
          Sair
        </button>
      </nav>
    </div>
  )
}