import { InferSelectModel, relations } from 'drizzle-orm';
import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { cartItemSchema } from './cart-item.schema';
import { pgTimestamp } from './timestamp';

export const productSchema = pgTable('products', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  price: integer().notNull(),
  aliases: text().array().$type<string[]>().default([]),
  ...pgTimestamp,
});

export const productRelations = relations(productSchema, ({ many }) => ({
  cartItems: many(cartItemSchema),
}));

export type Product = InferSelectModel<typeof productSchema>;
