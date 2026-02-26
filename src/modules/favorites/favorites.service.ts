import type { Favorite } from '@/shared/infrastructure/db/schemes/favorite.schema';

export interface IFavoritesService {
  getProductIds(favorites: Favorite[]): string[];
}

export class FavoritesService implements IFavoritesService {
  public getProductIds(favorites: Favorite[]) {
    return favorites.map(favorite => favorite.productId);
  }
}
