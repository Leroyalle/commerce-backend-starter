import { Order } from '@/shared/db/schema/order.schema';

export interface IOrderRepository {
  create(data: Omit<Order, 'id'>): Promise<Order>;
}
