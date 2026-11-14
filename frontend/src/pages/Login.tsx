import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, ErrorMessage, Field, SubmitButton } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../lib/api'

// conta de teste, usada só pelo botão de desenvolvimento
const DEMO = { nome: 'Jorge', email: 'demo@teste.com', senha: '123456' }

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, senha)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemo() {
    setError('')
    setLoading(true)
    try {
      try {
        await login(DEMO.email, DEMO.senha)
      } catch (err) {
        // 401 = conta não existe (backend reiniciou): cria e entra
        if (err instanceof ApiError && err.status === 401) {
          await register(DEMO.nome, DEMO.email, DEMO.senha)
        } else {
          throw err
        }
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre para ver suas finanças">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="E-mail"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Senha"
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <ErrorMessage message={error} />
        <SubmitButton loading={loading}>Entrar</SubmitButton>
      </form>

      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={handleDemo}
          disabled={loading}
          className="mt-3 w-full rounded-xl border border-dashed border-orange-400 bg-orange-50 py-2.5 text-sm font-medium text-orange-700 transition hover:bg-orange-100 disabled:opacity-60"
        >
          Entrar
        </button>
      )}

      <p className="mt-4 text-center text-sm text-neutral-500">
        Não tem conta?{' '}
        <Link to="/cadastro" className="font-medium text-orange-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  )
}