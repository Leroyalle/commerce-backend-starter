import { Order } from '@/shared/db/schema/order.schema';

import { CartCommands } from '../cart/cart.commands';
import { CartQueries } from '../cart/cart.queries';

import { IOrderRepository } from './order.repo';

interface Deps {
  orderRepo: IOrderRepository;
  cartQueries: CartQueries;
}

export class OrderCommands {
  constructor(private readonly deps: Deps) {}

  public create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.deps.orderRepo.create(data);
  }

  public async createOrder(userId: string, input: { phone: number }) {
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
        productId: item.productId,
        quantity: item.quantity,
        cartId: item.cartId,
      })),
    });

    // TODO: отправить уведомление о новом заказе в тг
  }
}
