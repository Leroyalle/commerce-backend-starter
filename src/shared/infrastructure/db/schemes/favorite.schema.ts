import { type InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

import { createSelectSchema } from '../../zod/schema-fabric';

import { productSchema } from './product.schema';
import { pgTimestamp } from './timestamp';
import { userSchema } from './user.schema';

export const favoriteSchema = pgTable(
  'favorites',
  {
    productId: uuid()
      .references(() => productSchema.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid()
      .references(() => userSchema.id, { onDelete: 'cascade' })
      .notNull(),
    ...pgTimestamp,
  },
  table => ({
    pk: primaryKey({
      columns: [table.userId, table.productId],
    }),
  }),
);

export const favoriteRelations = relations(favoriteSchema, ({ one }) => ({
  product: one(productSchema, {
    fields: [favoriteSchema.productId],
    references: [productSchema.id],
  }),
  user: one(userSchema, {
    fields: [favoriteSchema.userId],
    references: [userSchema.id],
  }),
}));

export type Favorite = InferSelectModel<typeof favoriteSchema>;

export const favoritesSelectSchema = createSelectSchema(favoriteSchema);
