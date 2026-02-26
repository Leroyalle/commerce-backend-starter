import { eq } from 'drizzle-orm';

import { db } from '@/shared/infrastructure/db/client';
import { CartItem, cartItemSchema } from '@/shared/infrastructure/db/schemes/cart-item.schema';

export interface ICartItemRepository {
  create: (item: Omit<CartItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CartItem>;
  delete: (id: string) => Promise<void>;
  update: (id: string, item: Partial<Omit<CartItem, 'id'>>) => Promise<CartItem>;
  clearByCart: (cartId: string) => Promise<void>;
}

export class CartItemRepo implements ICartItemRepository {
  public async create(item: Omit<CartItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CartItem> {
    return (await db.insert(cartItemSchema).values(item).returning())[0];
  }
  public async delete(id: string) {
    await db.delete(cartItemSchema).where(eq(cartItemSchema.id, id));
  }
  public async clearByCart(cartId: string) {
    await db.delete(cartItemSchema).where(eq(cartItemSchema.cartId, cartId));
  }
  public async update(id: string, item: Partial<Omit<CartItem, 'id'>>): Promise<CartItem> {
    return (
      await db.update(cartItemSchema).set(item).where(eq(cartItemSchema.id, id)).returning()
    )[0];
  }
}
