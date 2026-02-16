import { AccountCommands } from './account.commands';
import { AccountQueries } from './account.queries';
import { AccountRepo } from './account.repo';

export function createAccountModule() {
  const repository = new AccountRepo();
  const queries = new AccountQueries({ repository });
  const commands = new AccountCommands({ repository });
  return { queries, commands };
}
