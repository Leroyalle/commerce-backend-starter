import type { Bot } from 'grammy';
import Redis from 'ioredis';

import { createTelegramBot } from '@/shared/infrastructure/telegram/telegram-client';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import { TelegramCommands } from './telegram.commands';
import { createTelegramConsumer } from './telegram.consumer';
import { TelegramService } from './telegram.service';
import type { MyContext } from './types/context.type';

interface Deps {
  redis: Redis;
}

export function createTelegramModule(
  deps: Deps,
): CreateModuleResult<TelegramCommands> & { bot: Bot<MyContext> } {
  const bot = createTelegramBot();
  const service = new TelegramService();

  const commands = new TelegramCommands(bot, service);
  createTelegramConsumer({
    redis: deps.redis,
    telegramCommands: commands,
  });

  return { commands, bot };
}
