import { Order } from '@/shared/infrastructure/db/schema/order.schema';

import { CartQueries } from '../cart/cart.queries';
import { TelegramCommands } from '../telegram/telegram.commands';
import { UserQueries } from '../user/user.queries';

import { IOrderRepository } from './order.repo';

interface Deps {
  orderRepo: IOrderRepository;
  cartQueries: CartQueries;
  userQueries: UserQueries;
  notifierCommands: TelegramCommands;
}

export class OrderCommands {
  constructor(private readonly deps: Deps) {}

  public create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.deps.orderRepo.create(data);
  }

  public async createOrder(userId: string, input: { phone: string }) {
    const user = await this.deps.userQueries.findById(userId);

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const cart = await this.deps.cartQueries.findByUserId(userId);

    if (!cart) {
      throw new Error('Корзина не найдена');
    }

    const amount = cart.cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );

    const order = await this.create({
      userId,
      phone: input.phone,
      totalAmount: amount,
      items: cart.cartItems.map(item => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        cartId: item.cartId,
      })),
    });

    await this.deps.notifierCommands.notifyAdminNewOrder(user, order);

    // TODO: отправить уведомление о новом заказе в тг
  }
}
