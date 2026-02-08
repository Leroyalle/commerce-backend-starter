import Redis from 'ioredis';

import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { IDataCounterQueries } from '../data-counter/data-counter.queries';

import { ProductCommands } from './product.commands';
import { IProductQueries, ProductQueries } from './product.queries';
import { ProductQueriesCached } from './product.queries.cached';
import { ProductRepo } from './product.repo';

interface Deps {
  dataCounterQueries: IDataCounterQueries;
  redis: Redis;
}

export function createProductModule(
  deps: Deps,
): CreateModuleResult<ProductCommands, IProductQueries> {
  const productRepo = new ProductRepo();
  const commands = new ProductCommands({ productRepo });
  const productQueries = new ProductQueries({ productRepo });
  const cachedQueries = new ProductQueriesCached({
    productQueries,
    redis: deps.redis,
    getCount: deps.dataCounterQueries.getCount,
  });
  return { commands, queries: cachedQueries };
}
