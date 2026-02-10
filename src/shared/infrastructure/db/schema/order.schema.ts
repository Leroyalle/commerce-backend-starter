import { InferSelectModel, relations } from 'drizzle-orm';
import { customType, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { CartItem, CartItemWithRelations } from './cart-item.schema';
import { pgTimestamp } from './timestamp';
import { userSchema } from './user.schema';

const jsonbConfig = customType<{ data: CartItem[] }>({
  dataType() {
    return 'jsonb';
  },
  toDriver(value: CartItem[]) {
    return JSON.stringify(value);
  },
});

export const orderSchema = pgTable('orders', {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => userSchema.id, { onDelete: 'cascade' }),

  phone: varchar().notNull(),
  totalAmount: integer().notNull(),
  items: jsonbConfig().$type<Omit<CartItemWithRelations, 'cart' | 'productId'>[]>().notNull(),
  ...pgTimestamp,
});

export const orderRelations = relations(orderSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [orderSchema.userId],
    references: [userSchema.id],
  }),
}));

export type Order = InferSelectModel<typeof orderSchema>;
