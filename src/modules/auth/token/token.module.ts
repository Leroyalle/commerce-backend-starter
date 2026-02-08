import { JwtConfig } from './jwt.config';
import { TokenCommands } from './token.commands';
import { TokenRepo } from './token.repo';
import { TokenService } from './token.service';

export function createTokenModule() {
  const jwtConfig = new JwtConfig();
  const repository = new TokenRepo();
  const service = new TokenService(jwtConfig);
  const commands = new TokenCommands({ tokenRepo: repository, tokenService: service });

  return { commands, repository, service };
}
