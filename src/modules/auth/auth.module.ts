import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { AuthCommands } from './auth.command';
import { createAuthRouter } from './auth.router';
import { JwtConfig } from './jwt.config';
import { TokenCommands } from './token.commands';
import { TokenRepo } from './token.repo';
import { TokenService } from './token.service';

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
  const router = createAuthRouter(authCommands);
  return { commands: authCommands, router };
}
