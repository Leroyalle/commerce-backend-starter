import Redis from 'ioredis';

import { createQueue } from '@/shared/infrastructure/bullmq/queue-factory';
import { TAuthQueuePayload } from '@/shared/types/auth-queue-payload.type';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { AuthCommands } from './auth.command';
import { createCodeModule } from './code/code.module';
import { createTokenModule } from './token/token.module';

type CreateAuthModuleDeps = {
  userCommands: UserCommands;
  userQueries: UserQueries;
  redis: Redis;
};
export function createAuthModule(deps: CreateAuthModuleDeps): CreateModuleResult<AuthCommands> {
  const tokenModule = createTokenModule();
  const codeModule = createCodeModule({ redis: deps.redis });

  const producer = createQueue<TAuthQueuePayload['data'], any, TAuthQueuePayload['name']>(
    'auth',
    deps.redis,
  );
  const authCommands = new AuthCommands({
    tokenCommands: tokenModule.commands,
    tokenService: tokenModule.service,
    userCommands: deps.userCommands,
    userQueries: deps.userQueries,
    authProducer: producer,
    codeCommands: codeModule.commands,
    codeQueries: codeModule.queries,
  });
  return { commands: authCommands };
}
