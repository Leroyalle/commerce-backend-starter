import Redis from 'ioredis';

import { INotificationProducer } from '@/shared/infrastructure/broker/producers/notification.producer';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { AuthCommands } from './auth.commands';
import { createCodeModule } from './code/code.module';
import { createTokenModule } from './token/token.module';

type CreateAuthModuleDeps = {
  userCommands: UserCommands;
  userQueries: UserQueries;
  redis: Redis;
  notificationProducer: INotificationProducer;
};
export function createAuthModule(deps: CreateAuthModuleDeps): CreateModuleResult<AuthCommands> {
  const tokenModule = createTokenModule();
  const codeModule = createCodeModule({ redis: deps.redis });

  const authCommands = new AuthCommands({
    tokenCommands: tokenModule.commands,
    tokenQueries: tokenModule.queries,
    tokenService: tokenModule.service,
    userCommands: deps.userCommands,
    userQueries: deps.userQueries,
    codeCommands: codeModule.commands,
    codeQueries: codeModule.queries,
    notificationProducer: deps.notificationProducer,
  });
  return { commands: authCommands };
}
