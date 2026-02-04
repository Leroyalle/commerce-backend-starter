import { InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, uuid } from 'drizzle-orm/pg-core';

import { userSchema } from './user.schema';

export const cartSchema = pgTable('carts', {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid()
    .notNull()
    .unique()
    .references(() => userSchema.id, { onDelete: 'cascade' }),
});

export const cartRelation = relations(cartSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [cartSchema.userId],
    references: [userSchema.id],
  }),
}));

export type Cart = InferSelectModel<typeof cartSchema>;
