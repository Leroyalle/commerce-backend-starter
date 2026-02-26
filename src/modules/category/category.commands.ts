import { Category } from '@/shared/infrastructure/db/schemes/category.schema';

import { ICategoryRepository } from './category.repo';

export interface ICategoryCommands {
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
}

interface Deps {
  repository: ICategoryRepository;
}

export class CategoryCommands implements ICategoryCommands {
  constructor(private readonly deps: Deps) {}

  public async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) {
    return await this.deps.repository.create(data);
  }
}
