import { type InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, uuid } from 'drizzle-orm/pg-core';

import { productSchema } from './product.schema';
import { pgTimestamp } from './timestamp';
import { userSchema } from './user.schema';

export const favoritesSchema = pgTable('favorites', {
  id: uuid().defaultRandom().primaryKey(),
  productId: uuid().references(() => productSchema.id),
  userId: uuid().references(() => userSchema.id),
  ...pgTimestamp,
});

export const favoritesRelations = relations(favoritesSchema, ({ one }) => ({
  product: one(productSchema, {
    fields: [favoritesSchema.productId],
    references: [productSchema.id],
  }),

  user: one(userSchema, {
    fields: [favoritesSchema.userId],
    references: [userSchema.id],
  }),
}));

export type Favorite = InferSelectModel<typeof favoritesSchema>;
