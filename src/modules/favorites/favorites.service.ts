import type { Favorite } from '@/shared/infrastructure/db/schemes/favorite.schema';
import type { Product } from '@/shared/infrastructure/db/schemes/product.schema';

export interface IFavoritesService {
  getProductIds(favorites: Favorite[]): string[];
  markIsFavorite(products: Product[]): (Product & { isFavorite: boolean })[];
}

export class FavoritesService implements IFavoritesService {
  public getProductIds(favorites: Favorite[]) {
    return favorites.map(favorite => favorite.productId);
  }

  public markIsFavorite(products: Product[]) {
    return products.map(product => ({
      ...product,
      isFavorite: true,
    }));
  }
}
