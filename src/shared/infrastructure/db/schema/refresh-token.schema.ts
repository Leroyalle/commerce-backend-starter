import { InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { accountSchema } from './account.schema';
import { pgTimestamp } from './timestamp';

export const refreshTokenSchema = pgTable('refreshTokens', {
  id: uuid().defaultRandom().primaryKey(),
  jti: varchar().notNull(),
  token: varchar().notNull(),
  expAt: timestamp({ withTimezone: false }).notNull(),
  revokedAt: timestamp({ withTimezone: false }),
  accountId: uuid()
    .notNull()
    .references(() => accountSchema.id, { onDelete: 'cascade' }),
  ...pgTimestamp,
});

export const refreshTokenRelation = relations(refreshTokenSchema, ({ one }) => ({
  account: one(accountSchema, {
    fields: [refreshTokenSchema.accountId],
    references: [accountSchema.id],
  }),
}));

export type RefreshToken = InferSelectModel<typeof refreshTokenSchema>;
