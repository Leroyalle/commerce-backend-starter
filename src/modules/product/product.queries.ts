import { Product } from '@/shared/infrastructure/db/schemes/product.schema';
import { IPaginationResult } from '@/shared/types/pagination-result.type';

import { IProductRepository } from './product.repo';
import { FindProductsQuery } from './schemas/find-products.schema';

interface Deps {
  productRepo: IProductRepository;
}

export interface IProductQueries {
  findAll(
    query?: FindProductsQuery,
  ): Promise<IPaginationResult<Pick<Product, 'id' | 'name' | 'price' | 'image' | 'details'>>>;
  findById(id: string): Promise<Product>;
  findByIds(ids: string[]): Promise<Product[]>;
}

export class ProductQueries implements IProductQueries {
  constructor(private readonly deps: Deps) {}

  public findAll(query?: FindProductsQuery) {
    return this.deps.productRepo.findAll(query);
  }

  public findById(id: string) {
    return this.deps.productRepo.findById(id);
  }

  public findByIds(ids: string[]) {
    return this.deps.productRepo.findByIds(ids);
  }
}
