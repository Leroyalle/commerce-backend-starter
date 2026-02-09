import Redis from 'ioredis';
import { Index } from 'meilisearch';

import { Product } from '@/shared/infrastructure/db/schema/product.schema';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { IDataCounterCommands } from '../data-counter/data-counter.commands';
import { IDataCounterQueries } from '../data-counter/data-counter.queries';

import { ProductCommands } from './product.commands';
import { IProductQueries, ProductQueries } from './product.queries';
import { ProductQueriesCached } from './product.queries.cached';
import { ProductRepo } from './product.repo';

interface Deps {
  dataCounterQueries: IDataCounterQueries;
  dataCounterCommands: IDataCounterCommands;
  redis: Redis;
  searchIndex: Index<Pick<Product, 'id' | 'name' | 'price'>>;
}

export function createProductModule(
  deps: Deps,
): CreateModuleResult<ProductCommands, IProductQueries> {
  const productRepo = new ProductRepo();
  const commands = new ProductCommands({
    productRepo,
    searchIndex: deps.searchIndex,
    dataCounterCommands: deps.dataCounterCommands,
  });
  const productQueries = new ProductQueries({ productRepo });
  const cachedQueries = new ProductQueriesCached({
    productQueries,
    redis: deps.redis,
    dataCounterQueries: deps.dataCounterQueries,
    searchIndex: deps.searchIndex,
  });
  return { commands, queries: cachedQueries };
}
