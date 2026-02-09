import Redis from 'ioredis';
import { Index } from 'meilisearch';

import { RedisKeyPrefix } from '@/shared/constants/redis-key-prefix.constants';
import { Product } from '@/shared/infrastructure/db/schema/product.schema';
import { generateRedisKey } from '@/shared/lib/helpers/generate-redis-key.helper';
import { IPaginationResult } from '@/shared/types/pagination-result.type';
import { IPagination } from '@/shared/types/pagination.type';

import { IDataCounterQueries } from '../data-counter/data-counter.queries';

import { IProductQueries } from './product.queries';

interface Deps {
  redis: Redis;
  productQueries: IProductQueries;
  dataCounterQueries: IDataCounterQueries;
  searchIndex: Index<Pick<Product, 'id' | 'name' | 'price'>>;
}

export class ProductQueriesCached implements IProductQueries {
  constructor(private readonly deps: Deps) {}

  public async findAll(
    pagination: IPagination,
  ): Promise<IPaginationResult<Pick<Product, 'id' | 'name' | 'price'>>> {
    if (pagination.query) {
      const searchResults = await this.deps.searchIndex.search(pagination.query, {
        limit: pagination.limit,
      });
      return { total: searchResults.estimatedTotalHits, items: searchResults.hits };
    }

    const redisKey = generateRedisKey(RedisKeyPrefix.PRODUCT, pagination.page, pagination.limit);
    const cachedProducts = await this.deps.redis.get(redisKey);

    if (cachedProducts) {
      const count = await this.deps.dataCounterQueries.getCount('products');
      const products: Product[] = JSON.parse(cachedProducts);
      return { total: count, items: products };
    }

    const data = await this.deps.productQueries.findAll(pagination);

    await this.deps.redis.set(redisKey, JSON.stringify(data.items), 'EX', 60);
    return data;
  }

  public async findById(id: string): Promise<Product> {
    return this.deps.productQueries.findById(id);
  }
}
