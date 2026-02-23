import { eq } from 'drizzle-orm';

import type { DB } from '@/shared/infrastructure/db/client';
import { type Favorite, favoriteSchema } from '@/shared/infrastructure/db/schema/favorite.schema';

export interface IFavoritesRepository {
  create: (data: Omit<Favorite, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Favorite>;
  findAllByUser: (userId: string) => Promise<Favorite[]>;
}

interface Deps {
  db: DB;
}

export class FavoritesRepo implements IFavoritesRepository {
  constructor(private readonly deps: Deps) {}

  public async create(data: Omit<Favorite, 'id' | 'createdAt' | 'updatedAt'>) {
    return (await this.deps.db.insert(favoriteSchema).values(data).returning())[0];
  }

  public async findAllByUser(userId: string) {
    return await this.deps.db.query.favoriteSchema.findMany({
      where: eq(favoriteSchema.userId, userId),
    });
  }
}
