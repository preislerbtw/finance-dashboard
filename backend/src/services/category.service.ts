import { AppError } from '../errors'
import { Repositories } from '../repositories/interfaces'
import { Category } from '../types'

type CategoryInput = Pick<Category, 'nome' | 'tipo' | 'cor'>

export class CategoryService {
  constructor(private repos: Repositories) {}

  private async getOwned(userId: string, id: string) {
    const category = await this.repos.categories.findById(id)
    if (!category || category.userId !== userId) throw new AppError(404, 'Categoria não encontrada')
    return category
  }

  create(userId: string, data: CategoryInput) {
    return this.repos.categories.create({ ...data, userId })
  }

  async update(userId: string, id: string, data: Partial<CategoryInput>) {
    const current = await this.getOwned(userId, id)
    const emUso = (await this.repos.transactions.countByCategory(id)) > 0
    if (data.tipo && data.tipo !== current.tipo && emUso) {
      throw new AppError(409, 'Não dá para mudar o tipo de uma categoria que já tem lançamentos')
    }
    return this.repos.categories.update(id, data)
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id)
    if ((await this.repos.transactions.countByCategory(id)) > 0) {
      throw new AppError(409, 'Esta categoria tem lançamentos. Mude-os de categoria antes de excluir.')
    }
    await this.repos.categories.delete(id)
  }
}