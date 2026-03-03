import { Bot } from 'grammy';
import type { Message } from 'grammy/types';

import { Order } from '@/shared/infrastructure/db/schemes/order.schema';
import { User } from '@/shared/infrastructure/db/schemes/user.schema';
import { getEnv } from '@/shared/lib/helpers/get-env.helper';

import type { ITelegramService } from './telegram.service';
import type { MyContext } from './types/context.type';
import type { HandlerName } from './types/handlers.type';

export interface ITelegramCommands {
  notifyAdminNewOrder(customer: User, order: Order): Promise<void>;
  onStart: (ctx: MyContext) => Promise<Message.TextMessage>;
  onCallbackData: (ctx: MyContext) => Promise<Message.TextMessage | void>;
}

export class TelegramCommands implements ITelegramCommands {
  private adminChatId: string;
  constructor(
    private readonly bot: Bot<MyContext>,
    private readonly telegramService: ITelegramService,
  ) {
    this.adminChatId = getEnv('TELEGRAM_ADMIN_CHAT_ID');
  }

  public async notifyAdminNewOrder(customer: User, order: Order) {
    const items = order.items
      .map(
        (item, i) => `${i + 1}. ${item.product.name} × ${item.quantity} — ${item.product.price} ₽`,
      )
      .join('\n');

    const message = `
🆕 *Новый заказ*

*Order ID:* \`${order.id}\`
*Пользователь:* ${customer.id}
*Телефон:* ${order.phone}

*Состав заказа:*
${items}

*Итого:* ${order.totalAmount} ₽
*Создан:* ${order.createdAt}
`;
    // NOTE: createdAt не восстанавливается в Date после сериализации

    await this.bot.api.sendMessage(this.adminChatId, message, {
      parse_mode: 'Markdown',
    });
  }

  public async onStart(ctx: MyContext) {
    const userId = ctx.message?.from.id;
    if (!userId) return ctx.reply('Не передан userId');

    if (this.telegramService.isAdmin(userId)) {
      return await ctx.reply('Вы не являетесь администратором 👨‍💼');
    }
    return await ctx.reply('Выбери действие:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Создать продукт', callback_data: 'createProduct' }],
          [{ text: 'Удалить продукт', callback_data: 'deleteProduct' }],
        ],
      },
    });
  }

  public async onCallbackData(ctx: MyContext) {
    const userId = ctx.callbackQuery?.from.id;
    await ctx.answerCallbackQuery();
    if (!userId) return ctx.reply('Не передан userId');

    if (!this.telegramService.isAdmin(ctx.callbackQuery.from.id)) {
      return await ctx.reply('Вы не являетесь администратором 👨‍💼');
    }

    const data = ctx.callbackQuery.data;
    if (!data) return await ctx.reply('Произошла ошибка');

    const productHandlers: Record<HandlerName, (ctx: MyContext) => Promise<void>> = {
      createProduct: async (ctx: MyContext) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter('createProduct');
      },
      deleteProduct: async (ctx: MyContext) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter('removeProduct');
      },
    };

    if (data in productHandlers) {
      const handler = productHandlers[data as HandlerName];
      return await handler(ctx);
    }
  }
}
