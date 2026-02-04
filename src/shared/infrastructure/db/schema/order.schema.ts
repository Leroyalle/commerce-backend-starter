import { InferSelectModel, relations } from 'drizzle-orm';
import { customType, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { CartItem } from './cart-item.schema';
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

  phone: integer().notNull(),
  totalAmount: integer().notNull(),
  items: jsonbConfig().$type<CartItem[]>().notNull(),

  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const orderRelations = relations(orderSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [orderSchema.userId],
    references: [userSchema.id],
  }),
}));

export type Order = InferSelectModel<typeof orderSchema>;
