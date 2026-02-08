import { Product } from '@/shared/infrastructure/db/schema/product.schema';
import { IPaginationResult } from '@/shared/types/pagination-result.type';
import { IPagination } from '@/shared/types/pagination.type';

import { IProductRepository } from './product.repo';

interface Deps {
  productRepo: IProductRepository;
}

export interface IProductQueries {
  findAll(pagination?: IPagination): Promise<IPaginationResult<Product>>;
  findById(id: string): Promise<Product>;
}

export class ProductQueries implements IProductQueries {
  constructor(private readonly deps: Deps) {}

  public findAll(pagination?: IPagination) {
    return this.deps.productRepo.findAll(pagination);
  }

  public findById(id: string) {
    return this.deps.productRepo.findById(id);
  }
}
