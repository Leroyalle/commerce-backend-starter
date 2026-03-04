import type { Bot } from 'grammy';

import type { ProductCommands } from '../product/product.commands';

import type { ITelegramCommands } from './telegram.commands';
import type { MyContext } from './types/context.type';

interface Deps {
  bot: Bot<MyContext>;
  productCommands: ProductCommands;
  telegramCommands: ITelegramCommands;
}

export function createTelegramRouter(deps: Deps) {
  deps.bot.command('start', deps.telegramCommands.onStart);
  deps.bot.on('callback_query:data', deps.telegramCommands.onCallbackData);
  deps.bot.start();
}
