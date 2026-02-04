import { InferSelectModel, relations } from 'drizzle-orm';
import { date, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { userSchema } from './user.schema';

export const refreshTokenSchema = pgTable('refreshTokens', {
  id: uuid().defaultRandom().primaryKey(),
  jwi: varchar().notNull(),
  token: varchar().notNull(),
  expAt: date().notNull(),
  revokedAt: date(),
  userId: uuid()
    .notNull()
    .references(() => userSchema.id, { onDelete: 'cascade' }),
});

export const refreshTokenRelation = relations(refreshTokenSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [refreshTokenSchema.userId],
    references: [userSchema.id],
  }),
}));

export type RefreshToken = InferSelectModel<typeof refreshTokenSchema>;
