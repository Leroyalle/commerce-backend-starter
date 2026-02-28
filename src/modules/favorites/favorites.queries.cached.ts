import type Redis from 'ioredis';

import type { IFavoritesQueries } from './favorites.queries';
import type { IFavoritesService } from './favorites.service';

interface Deps {
  favoritesQueries: IFavoritesQueries;
  favoritesService: IFavoritesService;
  redis: Redis;
}

export class FavoritesQueriesCached implements IFavoritesQueries {
  constructor(private readonly deps: Deps) {}

  public async findAllByUserId(userId: string): Promise<string[]> {
    const key = `user:${userId}:favorites`;
    const cachedUserFavorites = await this.deps.redis.smembers(key);
    if (cachedUserFavorites.length) return cachedUserFavorites;
    const favoriteIds = await this.deps.favoritesQueries.findAllByUserId(userId);
    if (favoriteIds.length > 0) {
      await this.deps.redis.sadd(key, favoriteIds);
    }
    return favoriteIds;
  }
}
