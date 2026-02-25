import type { Favorite } from '@/shared/infrastructure/db/schema/favorite.schema';

import type { IFavoritesRepository } from './favorites.repo';

export interface IFavoritesCommands {
  add(data: Omit<Favorite, 'createdAt' | 'updatedAt'>): Promise<Favorite>;
  remove(data: Omit<Favorite, 'createdAt' | 'updatedAt'>): Promise<Favorite>;
}

interface Deps {
  favoritesRepo: IFavoritesRepository;
}

export class FavoritesCommands implements IFavoritesCommands {
  constructor(private readonly deps: Deps) {}

  public async add(data: { userId: string; productId: string }): Promise<Favorite> {
    return this.deps.favoritesRepo.create(data);
  }

  public async remove(data: { userId: string; productId: string }) {
    return this.deps.favoritesRepo.remove(data);
  }
}
