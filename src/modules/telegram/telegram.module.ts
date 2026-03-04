import type { Bot } from 'grammy';
import Redis from 'ioredis';

import { createTelegramBot } from '@/shared/infrastructure/telegram/telegram-client';
import { CreateModuleResult } from '@/shared/types/create-module.result.type';

import type { ProductCommands } from '../product/product.commands';

import { TelegramCommands } from './telegram.commands';
import { createTelegramConsumer } from './telegram.consumer';
import { TelegramConversations } from './telegram.conversations';
import { TelegramService } from './telegram.service';
import type { MyContext } from './types/context.type';

interface Deps {
  redis: Redis;
  productCommands: ProductCommands;
}

export function createTelegramModule(
  deps: Deps,
): CreateModuleResult<TelegramCommands> & { bot: Bot<MyContext> } {
  const conversations = new TelegramConversations({
    createProduct: deps.productCommands.create,
    removeProduct: deps.productCommands.remove,
  });
  const bot = createTelegramBot({ conversations });
  const service = new TelegramService();

  const commands = new TelegramCommands(bot, service);
  createTelegramConsumer({
    redis: deps.redis,
    telegramCommands: commands,
  });

  return { commands, bot };
}
