import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { AuthCommands } from './auth.command';
import { JwtConfig } from './token/jwt.config';
import { TokenCommands } from './token/token.commands';
import { TokenRepo } from './token/token.repo';
import { TokenService } from './token/token.service';

type CreateAuthModuleDeps = {
  userCommands: UserCommands;
  userQueries: UserQueries;
};
export function createAuthModule(deps: CreateAuthModuleDeps): CreateModuleResult<AuthCommands> {
  const jwtConfig = new JwtConfig();
  const tokenRepo = new TokenRepo();
  const tokenService = new TokenService(jwtConfig);
  const tokenCommands = new TokenCommands({ tokenRepo, tokenService });
  const authCommands = new AuthCommands({
    tokenCommands,
    tokenService,
    userCommands: deps.userCommands,
    userQueries: deps.userQueries,
  });
  return { commands: authCommands };
}
