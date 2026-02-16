import Redis from 'ioredis';

import { INotificationProducer } from '@/shared/infrastructure/broker/producers/notification.producer';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { createAccountModule } from './account/account.module';
import { AuthCommands } from './auth.commands';
import { AuthQueries, IAuthQueries } from './auth.queries';
import { createCodeModule } from './code/code.module';
import { createTokenModule } from './token/token.module';

type CreateAuthModuleDeps = {
  userCommands: UserCommands;
  userQueries: UserQueries;
  redis: Redis;
  notificationProducer: INotificationProducer;
};
export function createAuthModule(
  deps: CreateAuthModuleDeps,
): CreateModuleResult<AuthCommands, IAuthQueries> {
  const tokenModule = createTokenModule();
  const codeModule = createCodeModule({ redis: deps.redis });
  const accountModule = createAccountModule();
  const authQueries = new AuthQueries({
    tokenQueries: tokenModule.queries,
    accountQueries: accountModule.queries,
  });

  const authCommands = new AuthCommands({
    tokenCommands: tokenModule.commands,
    tokenQueries: tokenModule.queries,
    tokenService: tokenModule.service,
    userCommands: deps.userCommands,
    userQueries: deps.userQueries,
    codeCommands: codeModule.commands,
    codeQueries: codeModule.queries,
    notificationProducer: deps.notificationProducer,
    accountCommands: accountModule.commands,
    accountQueries: accountModule.queries,
  });
  return { commands: authCommands, queries: authQueries };
}
