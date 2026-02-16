import { DB } from '@/shared/infrastructure/db/client';
import { Category, categorySchema } from '@/shared/infrastructure/db/schema/category.schema';

export interface ICategoryCommands {
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
}

interface Deps {
  db: DB;
}

export class CategoryCommands implements ICategoryCommands {
  constructor(private readonly deps: Deps) {}

  public async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) {
    return (await this.deps.db.insert(categorySchema).values(data).returning())[0];
  }
}
