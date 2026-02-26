import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { categorySchema } from './category.schema';
import { productSchema } from './product.schema';

export const productsToCategoriesSchema = pgTable(
  'products_to_categories',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => productSchema.id),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categorySchema.id),
  },
  table => [primaryKey({ columns: [table.productId, table.categoryId] })],
);

export const productsToCategoriesRelations = relations(productsToCategoriesSchema, ({ one }) => ({
  category: one(categorySchema, {
    fields: [productsToCategoriesSchema.categoryId],
    references: [categorySchema.id],
  }),
  product: one(productSchema, {
    fields: [productsToCategoriesSchema.productId],
    references: [productSchema.id],
  }),
}));
