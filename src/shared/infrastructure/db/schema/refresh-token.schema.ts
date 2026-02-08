import { InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { pgTimestamp } from './timestamp';
import { userSchema } from './user.schema';

export const refreshTokenSchema = pgTable('refreshTokens', {
  id: uuid().defaultRandom().primaryKey(),
  jti: varchar().notNull(),
  token: varchar().notNull(),
  expAt: timestamp({ withTimezone: false }).notNull(),
  revokedAt: timestamp({ withTimezone: false }),
  userId: uuid()
    .notNull()
    .references(() => userSchema.id, { onDelete: 'cascade' }),
  ...pgTimestamp,
});

export const refreshTokenRelation = relations(refreshTokenSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [refreshTokenSchema.userId],
    references: [userSchema.id],
  }),
}));

export type RefreshToken = InferSelectModel<typeof refreshTokenSchema>;
