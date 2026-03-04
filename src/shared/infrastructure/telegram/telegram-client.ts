import { conversations, createConversation } from '@grammyjs/conversations';
import { Bot } from 'grammy';

import type { ITelegramConversations } from '@/modules/telegram/telegram.conversations';
import type { MyContext } from '@/modules/telegram/types/context.type';
import { getEnv } from '@/shared/lib/helpers/get-env.helper';

interface Deps {
  conversations: ITelegramConversations;
}

export function createTelegramBot(deps: Deps): Bot<MyContext> {
  const bot = new Bot<MyContext>(getEnv('BOT_API_KEY'));
  bot.use(conversations());
  bot.use(createConversation(deps.conversations.createProductConversation, 'createProduct'));
  bot.use(createConversation(deps.conversations.removeProductConversation, 'removeProduct'));
  return bot;
}
