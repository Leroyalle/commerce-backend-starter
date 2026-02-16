import { DB } from '@/shared/infrastructure/db/client';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { CategoryCommands, ICategoryCommands } from './category.commands';
import { CategoryQueries, ICategoryQueries } from './category.queries';
import { CategoryRepo } from './category.repo';

interface Deps {
  db: DB;
}

export function createCategoryModule(
  deps: Deps,
): CreateModuleResult<ICategoryCommands, ICategoryQueries> {
  const repository = new CategoryRepo({ db: deps.db });
  const queries = new CategoryQueries({ repository });
  const commands = new CategoryCommands({ repository });

  return { commands, queries };
}
