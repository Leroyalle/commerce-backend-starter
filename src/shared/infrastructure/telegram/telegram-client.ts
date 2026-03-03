import { Bot } from 'grammy';

import type { MyContext } from '@/modules/telegram/types/context.type';
import { getEnv } from '@/shared/lib/helpers/get-env.helper';

export function createTelegramBot(): Bot<MyContext> {
  const bot = new Bot<MyContext>(getEnv('BOT_API_KEY'));
  return bot;
}
