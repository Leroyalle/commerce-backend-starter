import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { categorySchema } from './category.schema';
import { productSchema } from './product.schema';

export const productsToCategories = pgTable(
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
