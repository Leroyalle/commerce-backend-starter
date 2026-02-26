import Redis from 'ioredis';
import { Index } from 'meilisearch';

import { RedisKeyPrefix } from '@/shared/constants/redis-key-prefix.constants';
import { Product } from '@/shared/infrastructure/db/schemes/product.schema';
import { generateRedisKey } from '@/shared/lib/helpers/generate-redis-key.helper';
import { IPaginationResult } from '@/shared/types/pagination-result.type';

import { IDataCounterQueries } from '../data-counter/data-counter.queries';

import { IProductQueries } from './product.queries';
import { FindProductsQuery } from './schemas/find-products.schema';

interface Deps {
  redis: Redis;
  productQueries: IProductQueries;
  dataCounterQueries: IDataCounterQueries;
  searchIndex: Index<Pick<Product, 'id' | 'name' | 'price' | 'image' | 'details'>>;
}

export class ProductQueriesCached implements IProductQueries {
  constructor(private readonly deps: Deps) {}

  public async findAll(
    query: FindProductsQuery,
  ): Promise<IPaginationResult<Pick<Product, 'id' | 'name' | 'price' | 'image' | 'details'>>> {
    if (query.query) {
      const searchResults = await this.deps.searchIndex.search(query.query, {
        limit: query.limit,
      });
      return { total: searchResults.estimatedTotalHits, items: searchResults.hits };
    }

    const redisKey = generateRedisKey(
      RedisKeyPrefix.PRODUCT,
      query.page,
      query.limit,
      query?.categoryId ?? '',
    );
    const cachedProducts = await this.deps.redis.get(redisKey);

    if (cachedProducts) {
      const products: IPaginationResult<
        Pick<Product, 'name' | 'id' | 'image' | 'price' | 'details'>
      > = JSON.parse(cachedProducts);
      return products;
    }

    const data = await this.deps.productQueries.findAll(query);

    await this.deps.redis.set(redisKey, JSON.stringify(data), 'EX', 60);
    return data;
  }

  public async findById(id: string): Promise<Product> {
    return this.deps.productQueries.findById(id);
  }

  public async findByIds(ids: string[]): Promise<Product[]> {
    return this.deps.productQueries.findByIds(ids);
  }
}
