import { InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';

import { cartItemSchema, cartItemSelectSchema, CartItemWithRelations } from './cart-item.schema';
import { userSchema } from './user.schema';

export const cartSchema = pgTable('carts', {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid()
    .notNull()
    .unique()
    .references(() => userSchema.id, { onDelete: 'cascade' }),
});

export const cartRelation = relations(cartSchema, ({ one, many }) => ({
  user: one(userSchema, {
    fields: [cartSchema.userId],
    references: [userSchema.id],
  }),
  cartItems: many(cartItemSchema),
}));

export const cartSelectSchema = createSelectSchema(cartSchema).extend({
  cartItems: cartItemSelectSchema.array(),
});

export type Cart = InferSelectModel<typeof cartSchema>;
export type CartWithRelations = Cart & { cartItems: Omit<CartItemWithRelations, 'cart'>[] };
