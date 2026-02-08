import Redis from 'ioredis';

import { RedisKeyPrefix } from '@/shared/constants/redis-key-prefix.constants';
import { Product } from '@/shared/infrastructure/db/schema/product.schema';
import { generateRedisKey } from '@/shared/lib/helpers/generate-redis-key.helper';
import { IPaginationResult } from '@/shared/types/pagination-result.type';
import { IPagination } from '@/shared/types/pagination.type';

import { IProductQueries } from './product.queries';

interface Deps {
  redis: Redis;
  productQueries: IProductQueries;
  getCount: (tableName: string) => Promise<number>;
}

export class ProductQueriesCached implements IProductQueries {
  constructor(private readonly deps: Deps) {}

  public async findAll(pagination: IPagination): Promise<IPaginationResult<Product>> {
    const redisKey = generateRedisKey(RedisKeyPrefix.PRODUCT, pagination.page, pagination.limit);
    const cachedProducts = await this.deps.redis.get(redisKey);

    if (cachedProducts) {
      const count = await this.deps.getCount('products');
      const products: Product[] = JSON.parse(cachedProducts);
      return { total: count, items: products };
    }

    const products = await this.deps.productQueries.findAll(pagination);

    await this.deps.redis.set(redisKey, JSON.stringify(products), 'EX', 60);
    return products;
  }

  public async findById(id: string): Promise<Product> {
    return this.deps.productQueries.findById(id);
  }
}
