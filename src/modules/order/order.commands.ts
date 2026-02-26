import { NotFoundException } from '@/shared/exceptions/exceptions';
import { INotificationProducer } from '@/shared/infrastructure/broker/producers/notification.producer';
import { Order } from '@/shared/infrastructure/db/schemes/order.schema';

import type { CartCommands } from '../cart/cart.commands';
import { CartQueries } from '../cart/cart.queries';
import { UserQueries } from '../user/user.queries';

import { IOrderRepository } from './order.repo';

interface Deps {
  orderRepo: IOrderRepository;
  cartQueries: CartQueries;
  userQueries: UserQueries;
  cartCommands: CartCommands;
  notificationProducer: INotificationProducer;
}

export class OrderCommands {
  constructor(private readonly deps: Deps) {}

  public create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.deps.orderRepo.create(data);
  }

  public async createOrder(userId: string, input: { phone: string }) {
    const user = await this.deps.userQueries.findById(userId);

    if (!user) throw NotFoundException.User();

    const cart = await this.deps.cartQueries.findByUserId(userId);

    if (!cart) throw NotFoundException.Cart();

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
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });

    await this.deps.cartCommands.clearCart(cart.id);

    await this.deps.notificationProducer.sendAdminTelegramNotification('new_order_alert', {
      user,
      order,
    });

    await this.deps.notificationProducer.sendEmail('order_confirmed_email', {
      email: user.email,
      orderId: order.id,
    });

    return { success: true };
  }
}
