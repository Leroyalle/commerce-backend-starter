import { and, eq } from 'drizzle-orm';

import type { DB } from '@/shared/infrastructure/db/client';
import { type Favorite, favoriteSchema } from '@/shared/infrastructure/db/schemes/favorite.schema';

export interface IFavoritesRepository {
  create: (data: { userId: string; productId: string }) => Promise<Favorite>;
  remove: (data: { productId: string; userId: string }) => Promise<Favorite>;
  findAllByUser: (userId: string) => Promise<Favorite[]>;
  findOne: (data: { productId: string; userId: string }) => Promise<Favorite | undefined>;
}

interface Deps {
  db: DB;
}

export class FavoritesRepo implements IFavoritesRepository {
  constructor(private readonly deps: Deps) {}

  public async create(data: { userId: string; productId: string }) {
    const result = await this.deps.db
      .insert(favoriteSchema)
      .values(data)
      .onConflictDoNothing()
      .returning();

    if (result.length !== 0) return result[0];

    const existing = await this.deps.db.query.favoriteSchema.findFirst({
      where: and(
        eq(favoriteSchema.productId, data.productId),
        eq(favoriteSchema.userId, data.userId),
      ),
    });

    if (!existing) {
      throw new Error('Invariant violation: favorite not found after conflict');
    }

    return existing;
  }

  public async findOne(data: { productId: string; userId: string }) {
    return await this.deps.db.query.favoriteSchema.findFirst({
      where: and(
        eq(favoriteSchema.productId, data.productId),
        eq(favoriteSchema.userId, data.userId),
      ),
    });
  }

  public async remove(data: { productId: string; userId: string }) {
    return (
      await this.deps.db
        .delete(favoriteSchema)
        .where(
          and(eq(favoriteSchema.productId, data.productId), eq(favoriteSchema.userId, data.userId)),
        )
        .returning()
    )[0];
  }

  public async findAllByUser(userId: string) {
    return await this.deps.db.query.favoriteSchema.findMany({
      where: eq(favoriteSchema.userId, userId),
    });
  }
}
