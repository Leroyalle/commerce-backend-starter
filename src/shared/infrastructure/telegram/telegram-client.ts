import { Bot } from 'grammy';

import { getEnv } from '@/shared/lib/helpers/get-env.helper';

export function createTelegramBot(): Bot {
  const bot = new Bot(getEnv('TELEGRAM_BOT_TOKEN'));
  return bot;
}
