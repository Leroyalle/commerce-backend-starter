import Redis from 'ioredis';

import { CodeCommands } from './code.commands';
import { CodeQueries } from './code.queries';

interface Deps {
  redis: Redis;
}

export function createCodeModule(deps: Deps) {
  const queries = new CodeQueries({ redis: deps.redis });
  const commands = new CodeCommands({ redis: deps.redis });

  return { commands, queries };
}
