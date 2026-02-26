import type { IFavoritesRepository } from './favorites.repo';
import type { IFavoritesService } from './favorites.service';

export interface IFavoritesQueries {
  findAllByUserId(userId: string): Promise<string[]>;
}

interface Deps {
  favoritesRepo: IFavoritesRepository;
  favoritesService: IFavoritesService;
}

export class FavoritesQueries implements IFavoritesQueries {
  constructor(private readonly deps: Deps) {}

  public async findAllByUserId(userId: string): Promise<string[]> {
    return this.deps.favoritesService.getProductIds(
      await this.deps.favoritesRepo.findAllByUser(userId),
    );
  }
}
