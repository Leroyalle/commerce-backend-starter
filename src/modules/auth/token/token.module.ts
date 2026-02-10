import { JwtConfig } from './jwt.config';
import { TokenCommands } from './token.commands';
import { TokenQueries } from './token.queries';
import { TokenRepo } from './token.repo';
import { TokenService } from './token.service';

export function createTokenModule() {
  const jwtConfig = new JwtConfig();
  const repository = new TokenRepo();
  const queries = new TokenQueries({ tokenRepo: repository });
  const service = new TokenService(jwtConfig);
  const commands = new TokenCommands({ tokenRepo: repository, tokenService: service });

  return { commands, repository, service, queries };
}
