import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, ErrorMessage, Field, SubmitButton } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
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

      <p className="mt-4 text-center text-sm text-neutral-500">
        Não tem conta?{' '}
        <Link to="/cadastro" className="font-medium text-orange-600 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  )
}