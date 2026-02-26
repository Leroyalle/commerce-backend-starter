import { Category } from '@/shared/infrastructure/db/schemes/category.schema';

import { ICategoryRepository } from './category.repo';

export interface ICategoryQueries {
  findAll: () => Promise<Category[]>;
  getById: (id: string) => Promise<Category | undefined>;
}

interface Deps {
  repository: ICategoryRepository;
}

export class CategoryQueries implements ICategoryQueries {
  constructor(private readonly deps: Deps) {}

  public async findAll() {
    return await this.deps.repository.getAll();
  }

  public async getById(id: string) {
    return await this.deps.repository.getById(id);
  }
}
