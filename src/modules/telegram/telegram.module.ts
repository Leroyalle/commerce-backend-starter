import Redis from 'ioredis';

import { createTelegramBot } from '@/shared/infrastructure/telegram/telegram-client';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { TelegramCommands } from './telegram.commands';
import { createTelegramConsumer } from './telegram.consumer';

interface Deps {
  redis: Redis;
}

export function createTelegramModule(deps: Deps): CreateModuleResult<TelegramCommands> {
  const bot = createTelegramBot();

  const commands = new TelegramCommands(bot);
  createTelegramConsumer({
    redis: deps.redis,
    telegramCommands: commands,
  });

  return { commands };
}
