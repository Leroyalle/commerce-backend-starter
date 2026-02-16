import { DB } from '@/shared/infrastructure/db/client';
import { Category } from '@/shared/infrastructure/db/schema/category.schema';

export interface ICategoryQueries {
  findAll: () => Promise<Category[]>;
}

interface Deps {
  db: DB;
}

export class CategoryQueries implements ICategoryQueries {
  constructor(private readonly deps: Deps) {}

  public async findAll() {
    return await this.deps.db.query.categorySchema.findMany();
  }
}
