import { OauthCommands } from './oauth.commands';
import { OauthQueries } from './oauth.queries';
import { OauthRepo } from './oauth.repo';

export function createOauthModule() {
  const repository = new OauthRepo();
  const queries = new OauthQueries({ repository });
  const commands = new OauthCommands({ repository });
  return { queries, commands };
}
