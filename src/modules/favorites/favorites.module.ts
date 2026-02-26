import type Redis from 'ioredis';

import type { DB } from '@/shared/infrastructure/db/client';
import type { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { FavoritesCommands, type IFavoritesCommands } from './favorites.commands';
import { FavoritesQueries, type IFavoritesQueries } from './favorites.queries';
import { FavoritesQueriesCached } from './favorites.queries.cached';
import { FavoritesRepo } from './favorites.repo';
import { FavoritesService, type IFavoritesService } from './favorites.service';

interface Deps {
  db: DB;
  redis: Redis;
}

export function createFavoritesModule(
  deps: Deps,
): CreateModuleResult<IFavoritesCommands, IFavoritesQueries, IFavoritesService> {
  const repository = new FavoritesRepo({ db: deps.db });
  const commands = new FavoritesCommands({ favoritesRepo: repository, redis: deps.redis });
  const service = new FavoritesService();
  const queries = new FavoritesQueries({ favoritesRepo: repository, favoritesService: service });
  const cachedQueries = new FavoritesQueriesCached({
    favoritesQueries: queries,
    favoritesService: service,
    redis: deps.redis,
  });

  return { commands, queries: cachedQueries, services: service };
}
