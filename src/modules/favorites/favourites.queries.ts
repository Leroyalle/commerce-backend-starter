import type { Favorite } from '@/shared/infrastructure/db/schema/favorite.schema';

import type { IFavoritesRepository } from './favorites.repo';

export interface IFavoritesQueries {
  findAllByUserId(userId: string): Promise<Favorite[]>;
}

interface Deps {
  favoritesRepo: IFavoritesRepository;
}

export class FavoritesQueries implements IFavoritesQueries {
  constructor(private readonly deps: Deps) {}

  public async findAllByUserId(userId: string): Promise<Favorite[]> {
    return this.deps.favoritesRepo.findAllByUser(userId);
  }
}
