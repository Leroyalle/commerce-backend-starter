import { Index } from 'meilisearch';

import { Product } from '@/shared/infrastructure/db/schemes/product.schema';

import { IDataCounterCommands } from '../data-counter/data-counter.commands';

import { IProductRepository } from './product.repo';
import type { TCreateProduct } from './schemas/create-product.schema';

export interface IProductCommands {
  create: (data: TCreateProduct) => Promise<Product>;
  remove: (id: string) => Promise<Product>;
}

interface Deps {
  productRepo: IProductRepository;
  searchIndex: Index<Pick<Product, 'id' | 'name' | 'price'>>;
  dataCounterCommands: IDataCounterCommands;
}

export class ProductCommands implements IProductCommands {
  constructor(private readonly deps: Deps) {}

  public create = async (data: TCreateProduct) => {
    const product = await this.deps.productRepo.create(data);
    await this.deps.searchIndex.addDocuments([product]);
    await this.deps.dataCounterCommands.updateCount('increment', 'products');
    return product;
  };

  public remove = async (productId: string) => {
    const product = await this.deps.productRepo.remove(productId);
    await this.deps.searchIndex.deleteDocument(productId);
    await this.deps.dataCounterCommands.updateCount('decrement', 'products');
    return product;
  };
}
