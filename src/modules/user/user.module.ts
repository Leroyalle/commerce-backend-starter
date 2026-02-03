import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';
import { UserRepo } from './user.repo';
import { createUserRouter } from './user.router';

// CreateModuleResult<UserCommands>;
export function createUserModule() {
  const userRepo = new UserRepo();
  const commands = new UserCommands({
    userRepo,
  });
  const queries = new UserQueries({ userRepo });

  const router = createUserRouter(commands, queries);

  return { commands, router, queries };
}
