import { Index } from 'meilisearch';

import { Product } from '@/shared/infrastructure/db/schema/product.schema';

import { IDataCounterCommands } from '../data-counter/data-counter.commands';

import { IProductRepository } from './product.repo';

interface Deps {
  productRepo: IProductRepository;
  searchIndex: Index<Pick<Product, 'id' | 'name' | 'price'>>;
  dataCounterCommands: IDataCounterCommands;
}

export class ProductCommands {
  constructor(private readonly deps: Deps) {}

  public async create(data: { name: string; price: number; aliases: string[] }) {
    const product = await this.deps.productRepo.create(data);
    await this.deps.searchIndex.addDocuments([product]);
    await this.deps.dataCounterCommands.updateCount('increment', 'products');
    return product;
  }
}
