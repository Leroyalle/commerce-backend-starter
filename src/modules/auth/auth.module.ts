import Redis from 'ioredis';

import { createQueue } from '@/shared/infrastructure/bullmq/queue-factory';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { AuthCommands } from './auth.command';
import { JwtConfig } from './token/jwt.config';
import { TokenCommands } from './token/token.commands';
import { createTokenModule } from './token/token.module';
import { TokenRepo } from './token/token.repo';
import { TokenService } from './token/token.service';

type CreateAuthModuleDeps = {
  userCommands: UserCommands;
  userQueries: UserQueries;
  redis: Redis;
};
export function createAuthModule(deps: CreateAuthModuleDeps): CreateModuleResult<AuthCommands> {
  const tokenModule = createTokenModule();
  const producer = createQueue('auth', deps.redis);
  const authCommands = new AuthCommands({
    tokenCommands: tokenModule.commands,
    tokenService: tokenModule.service,
    userCommands: deps.userCommands,
    userQueries: deps.userQueries,
    authProducer: producer,
  });
  return { commands: authCommands };
}
