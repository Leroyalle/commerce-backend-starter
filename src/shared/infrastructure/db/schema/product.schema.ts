import { InferSelectModel, relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { cartItemSchema } from './cart-item.schema';
import { pgTimestamp } from './timestamp';

export const productSchema = pgTable('products', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  price: integer().notNull(),
  details: jsonb().$type<Record<string, unknown>>().default({}),
  aliases: text().array().$type<string[]>().default([]),
  ...pgTimestamp,
});

export const productRelations = relations(productSchema, ({ many }) => ({
  cartItems: many(cartItemSchema),
}));

export type Product = InferSelectModel<typeof productSchema>;
