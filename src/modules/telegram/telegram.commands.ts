import { Bot } from 'grammy';

import { Order } from '@/shared/infrastructure/db/schemes/order.schema';
import { User } from '@/shared/infrastructure/db/schemes/user.schema';
import { getEnv } from '@/shared/lib/helpers/get-env.helper';

export interface ITelegramCommands {
  notifyAdminNewOrder(customer: User, order: Order): Promise<void>;
}

export class TelegramCommands implements ITelegramCommands {
  private adminChatId: string;
  constructor(private readonly bot: Bot) {
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
}
