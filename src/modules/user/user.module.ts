import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { AuthCommands } from '../auth/auth.command';

import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { UserRepo } from './user.repo';
import { createUserRouter } from './user.router';

type CreateUserModuleDeps = {
  authCommands: AuthCommands;
};

export function createUserModule(
  deps: CreateUserModuleDeps,
): CreateModuleResult<UserCommands, UserQueries> {
  const userRepo = new UserRepo();
  const commands = new UserCommands({
    userRepo,
  });
  const queries = new UserQueries({ userRepo });

  const router = createUserRouter(commands, queries, deps.authCommands.verifyToken);

  return { commands, router, queries };
}
