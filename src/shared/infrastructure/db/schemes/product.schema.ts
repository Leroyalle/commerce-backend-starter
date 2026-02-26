import { InferSelectModel, relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { createSelectSchema } from '../../zod/schema-fabric';

import { cartItemSchema } from './cart-item.schema';
import { favoriteSchema } from './favorite.schema';
import { productsToCategoriesSchema } from './products-to-categories.schema';
import { pgTimestamp } from './timestamp';

export const productSchema = pgTable('products', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  image: text().notNull(),
  description: text().notNull(),
  price: integer().notNull(),
  details: jsonb().$type<Record<string, unknown>>().default({}),
  aliases: text().array().$type<string[]>().default([]),
  ...pgTimestamp,
});

export const productRelations = relations(productSchema, ({ many }) => ({
  cartItems: many(cartItemSchema),
  productsToCategories: many(productsToCategoriesSchema),
  favorites: many(favoriteSchema),
}));

export const productSelectSchema = createSelectSchema(productSchema);

export type Product = InferSelectModel<typeof productSchema>;
