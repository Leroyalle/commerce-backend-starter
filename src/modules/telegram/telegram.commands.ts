import { Bot } from 'grammy';
import type { Message } from 'grammy/types';

import { Order } from '@/shared/infrastructure/db/schemes/order.schema';
import { User } from '@/shared/infrastructure/db/schemes/user.schema';
import { getEnv } from '@/shared/lib/helpers/get-env.helper';

import type { ITelegramService } from './telegram.service';
import type { MyContext } from './types/context.type';

export interface ITelegramCommands {
  notifyAdminNewOrder(customer: User, order: Order): Promise<void>;
  onStart: (ctx: MyContext) => Promise<Message.TextMessage>;
}

export class TelegramCommands implements ITelegramCommands {
  private adminChatId: string;
  constructor(
    private readonly bot: Bot,
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
    if (!userId) {
      return ctx.reply('Не передан userId');
    }
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
}
