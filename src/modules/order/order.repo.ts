import { eq } from 'drizzle-orm';

import { db } from '@/shared/db/client';
import { Order, orderSchema } from '@/shared/db/schema/order.schema';

export interface IOrderRepository {
  create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  findAllByUserId(userId: string): Promise<Order[]>;
}

export class OrderRepo implements IOrderRepository {
  public async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    return (await db.insert(orderSchema).values(data).returning())[0];
  }

  public async findAllByUserId(userId: string): Promise<Order[]> {
    return await db.query.orderSchema.findMany({
      where: eq(orderSchema.userId, userId),
    });
  }
}
