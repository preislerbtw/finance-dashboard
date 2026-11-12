import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { AppError } from '../errors'
import { Repositories } from '../repositories/interfaces'
import { Category } from '../types'

const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'userId'>[] = [
  { nome: 'Salário', tipo: 'receita', cor: '#22c55e' },
  { nome: 'Mercado', tipo: 'despesa', cor: '#f97316' },
  { nome: 'Moradia', tipo: 'despesa', cor: '#3b82f6' },
  { nome: 'Contas (luz, água, internet)', tipo: 'despesa', cor: '#eab308' },
  { nome: 'Transporte', tipo: 'despesa', cor: '#8b5cf6' },
  { nome: 'Saúde', tipo: 'despesa', cor: '#ef4444' },
  { nome: 'Lazer', tipo: 'despesa', cor: '#ec4899' },
  { nome: 'Outros', tipo: 'despesa', cor: '#6b7280' },
]

export class AuthService {
  constructor(private repos: Repositories) {}

  private signToken(userId: string) {
    return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '7d' })
  }

  async register(input: { nome: string; email: string; senha: string }) {
    if (await this.repos.users.findByEmail(input.email)) {
      throw new AppError(409, 'E-mail já cadastrado')
    }
    const senhaHash = await bcrypt.hash(input.senha, 10)
    const user = await this.repos.users.create({ nome: input.nome, email: input.email, senhaHash })
    for (const c of DEFAULT_CATEGORIES) {
      await this.repos.categories.create({ ...c, userId: user.id })
    }
    return { token: this.signToken(user.id), user: { id: user.id, nome: user.nome, email: user.email } }
  }

  async login(input: { email: string; senha: string }) {
    const user = await this.repos.users.findByEmail(input.email)
    if (!user || !(await bcrypt.compare(input.senha, user.senhaHash))) {
      throw new AppError(401, 'E-mail ou senha inválidos')
    }
    return { token: this.signToken(user.id), user: { id: user.id, nome: user.nome, email: user.email } }
  }
}
