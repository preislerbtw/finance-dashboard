import { Moon, Sun } from 'lucide-react'
import { ReactNode } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '', children }: { className?: string; children?: ReactNode }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
      className={`flex items-center justify-center rounded-full transition ${className}`}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      {children}
    </button>
  )
}