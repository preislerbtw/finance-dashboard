import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { api, tokenStorage } from '../lib/api'

export interface AuthUser {
  id: string
  nome: string
  email: string
}

interface AuthResponse {
  token: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => void
}

const USER_KEY = 'finance:user'
const AuthContext = createContext<AuthContextValue | null>(null)

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw && tokenStorage.get() ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser)

  const persist = useCallback((data: AuthResponse) => {
    tokenStorage.set(data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)
  }, [])

  const login = useCallback(
    async (email: string, senha: string) =>
      persist(await api<AuthResponse>('/auth/login', { method: 'POST', body: { email, senha } })),
    [persist],
  )

  const register = useCallback(
    async (nome: string, email: string, senha: string) =>
      persist(await api<AuthResponse>('/auth/register', { method: 'POST', body: { nome, email, senha } })),
    [persist],
  )

  const logout = useCallback(() => {
    tokenStorage.clear()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}