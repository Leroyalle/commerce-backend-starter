import { InferSelectModel, relations } from 'drizzle-orm';
import { integer, pgTable, uuid } from 'drizzle-orm/pg-core';

import { Cart, cartSchema } from './cart.schema';
import { Product, productSchema } from './product.schema';

export const cartItemSchema = pgTable('cartItems', {
  id: uuid().defaultRandom().primaryKey(),
  productId: uuid()
    .notNull()
    .references(() => productSchema.id, { onDelete: 'cascade' }),
  cartId: uuid()
    .notNull()
    .references(() => cartSchema.id, { onDelete: 'cascade' }),
  quantity: integer().notNull(),
});

export const cartItemRelations = relations(cartItemSchema, ({ one }) => ({
  cart: one(cartSchema, {
    fields: [cartItemSchema.cartId],
    references: [cartSchema.id],
  }),
  product: one(productSchema, {
    fields: [cartItemSchema.productId],
    references: [productSchema.id],
  }),
}));

export type CartItem = InferSelectModel<typeof cartItemSchema>;
export type CartItemWithRelations = CartItem & {
  cart: Cart;
  product: Product;
};
