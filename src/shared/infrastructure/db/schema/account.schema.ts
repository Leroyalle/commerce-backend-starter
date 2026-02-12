import { InferSelectModel, relations } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { ProviderName, providersMap } from '@/modules/auth/constants/providers-map.constant';

import { pgTimestamp } from './timestamp';
import { roleEnum, userSchema } from './user.schema';

const providersArray = Object.keys(providersMap) as [ProviderName, ...ProviderName[]];
const providers = pgEnum('provider', providersArray);
const type = pgEnum('type', ['oauth', 'credentials']);

export const oauthAccountSchema = pgTable('oauthAccounts', {
  accountId: uuid()
    .primaryKey()
    .references(() => accountSchema.id, { onDelete: 'cascade' }),
  providerAccountId: text().notNull(),
  ...pgTimestamp,
});

export const credentialsAccountSchema = pgTable('credentialsAccounts', {
  accountId: uuid()
    .primaryKey()
    .references(() => accountSchema.id, { onDelete: 'cascade' }),
  email: text().notNull().unique(),
  password: text().notNull(),
  role: roleEnum().notNull(),
  isVerified: boolean().notNull().default(false),
  ...pgTimestamp,
});

export const accountSchema = pgTable('accounts', {
  id: uuid().defaultRandom().primaryKey(),
  provider: providers().notNull(),
  type: type().notNull(),
  userId: uuid().references(() => userSchema.id, { onDelete: 'cascade' }),
  ...pgTimestamp,
});

export const accountRelations = relations(accountSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [accountSchema.userId],
    references: [userSchema.id],
  }),
  oauthAccount: one(oauthAccountSchema),
  credentialsAccount: one(credentialsAccountSchema),
}));

export type AccountSchema = InferSelectModel<typeof accountSchema>;
