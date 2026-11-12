import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout, ErrorMessage, Field, SubmitButton } from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (senha.length < 6) return setError('A senha precisa ter ao menos 6 caracteres')
    if (senha !== confirmar) return setError('As senhas não conferem')

    setLoading(true)
    try {
      await register(nome, email, senha)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Organize suas receitas e despesas">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Nome"
          required
          minLength={2}
          autoComplete="name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
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
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <Field
          label="Confirmar senha"
          type="password"
          required
          autoComplete="new-password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />
        <ErrorMessage message={error} />
        <SubmitButton loading={loading}>Criar conta</SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-orange-600 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}