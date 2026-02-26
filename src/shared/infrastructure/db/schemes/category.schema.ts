import { InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { createSelectSchema } from '../../zod/schema-fabric';

import { productsToCategoriesSchema } from './products-to-categories.schema';

export const categorySchema = pgTable('categories', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  description: text().notNull(),
});

export const categoryRelations = relations(categorySchema, ({ many }) => ({
  productsToCategories: many(productsToCategoriesSchema),
}));

export const categorySelectSchema = createSelectSchema(categorySchema);
export type Category = InferSelectModel<typeof categorySchema>;
