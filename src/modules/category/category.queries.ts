import { Category } from '@/shared/infrastructure/db/schema/category.schema';

import { ICategoryRepository } from './category.repo';

export interface ICategoryQueries {
  findAll: () => Promise<Category[]>;
}

interface Deps {
  repository: ICategoryRepository;
}

export class CategoryQueries implements ICategoryQueries {
  constructor(private readonly deps: Deps) {}

  public async findAll() {
    return await this.deps.repository.getAll();
  }
}
