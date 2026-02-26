import type Redis from 'ioredis';

import type { Favorite } from '@/shared/infrastructure/db/schemes/favorite.schema';

import type { IFavoritesRepository } from './favorites.repo';

export interface IFavoritesCommands {
  add(data: Omit<Favorite, 'createdAt' | 'updatedAt'>): Promise<Favorite>;
  remove(data: Omit<Favorite, 'createdAt' | 'updatedAt'>): Promise<Favorite>;
}

interface Deps {
  favoritesRepo: IFavoritesRepository;
  redis: Redis;
}

export class FavoritesCommands implements IFavoritesCommands {
  constructor(private readonly deps: Deps) {}

  public async add(data: { userId: string; productId: string }): Promise<Favorite> {
    const existing = await this.deps.favoritesRepo.create(data);
    await this.deps.redis.sadd(`user:${data.userId}:favorites`, data.productId);
    return existing;
  }

  public async remove(data: { userId: string; productId: string }) {
    const removed = this.deps.favoritesRepo.remove(data);
    await this.deps.redis.srem(`user:${data.userId}:favorites`, data.productId);
    return removed;
  }
}
