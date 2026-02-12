import { InferSelectModel, relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { ProviderName, providersMap } from '@/modules/auth/constants/providers-map.constant';

import { pgTimestamp } from './timestamp';
import { userSchema } from './user.schema';

const providersArray = Object.keys(providersMap) as [ProviderName, ...ProviderName[]];
const providers = pgEnum('provider', providersArray);

export const oauthAccountSchema = pgTable('oauthAccounts', {
  id: uuid().defaultRandom().primaryKey(),
  provider: providers().notNull(),
  providerAccountId: text().notNull(),
  type: text().notNull(),
  userId: uuid()
    .notNull()
    .references(() => userSchema.id, { onDelete: 'cascade' }),
  ...pgTimestamp,
});

export const oauthAccountRelations = relations(oauthAccountSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [oauthAccountSchema.userId],
    references: [userSchema.id],
  }),
}));

export type OauthAccount = InferSelectModel<typeof oauthAccountSchema>;
