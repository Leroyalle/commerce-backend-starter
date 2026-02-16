import { DB } from '@/shared/infrastructure/db/client';
import { Category, categorySchema } from '@/shared/infrastructure/db/schema/category.schema';

export interface ICategoryRepo {
  getAll: () => Promise<Category[]>;
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
}

interface Deps {
  db: DB;
}

export class CategoryRepo implements ICategoryRepo {
  constructor(private readonly deps: Deps) {}

  public async getAll() {
    return await this.deps.db.query.categorySchema.findMany();
  }

  public async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) {
    return (await this.deps.db.insert(categorySchema).values(data).returning())[0];
  }
}
