import { relations } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { productSchema } from './product.schema';

export const categorySchema = pgTable('categories', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
});

export const categoryRelations = relations(categorySchema, ({ many }) => ({
  products: many(productSchema),
}));
