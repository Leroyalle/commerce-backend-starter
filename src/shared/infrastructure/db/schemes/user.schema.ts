import { InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { createSelectSchema } from '../../zod/schema-fabric';

import { accountSchema } from './account.schema';
import { cartSchema } from './cart.schema';
import { favoriteSchema } from './favorite.schema';
import { orderSchema } from './order.schema';
import { pgTimestamp } from './timestamp';

export const userSchema = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerifiedAt: timestamp({ withTimezone: false }),
  ...pgTimestamp,
});

export const userRelation = relations(userSchema, ({ many, one }) => ({
  accounts: many(accountSchema),
  cart: one(cartSchema),
  orders: many(orderSchema),
  favorites: many(favoriteSchema),
}));

export type User = InferSelectModel<typeof userSchema>;
export const userSelectSchema = createSelectSchema(userSchema);
