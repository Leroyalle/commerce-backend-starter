import type { DB } from '@/shared/infrastructure/db/client';
import type { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { FavoritesCommands, type IFavoritesCommands } from './favorites.commands';
import { FavoritesRepo } from './favorites.repo';
import { FavoritesQueries, type IFavoritesQueries } from './favourites.queries';

interface Deps {
  db: DB;
}

export function createFavoritesModule(
  deps: Deps,
): CreateModuleResult<IFavoritesCommands, IFavoritesQueries> {
  const repository = new FavoritesRepo({ db: deps.db });
  const commands = new FavoritesCommands({ favoritesRepo: repository });
  const queries = new FavoritesQueries({ favoritesRepo: repository });

  return { commands, queries };
}
