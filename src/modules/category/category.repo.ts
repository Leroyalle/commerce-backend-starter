import { eq } from 'drizzle-orm';

import { DB } from '@/shared/infrastructure/db/client';
import { Category, categorySchema } from '@/shared/infrastructure/db/schemes/category.schema';

export interface ICategoryRepository {
  getAll: () => Promise<Category[]>;
  create: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  getById: (id: string) => Promise<Category | undefined>;
}

interface Deps {
  db: DB;
}

export class CategoryRepo implements ICategoryRepository {
  constructor(private readonly deps: Deps) {}

  public async getAll() {
    return await this.deps.db.query.categorySchema.findMany();
  }

  public async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) {
    return (await this.deps.db.insert(categorySchema).values(data).returning())[0];
  }

  public async getById(id: string) {
    return await this.deps.db.query.categorySchema.findFirst({ where: eq(categorySchema.id, id) });
  }
}
