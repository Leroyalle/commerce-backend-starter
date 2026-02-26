import { InferSelectModel, relations } from 'drizzle-orm';
import { index, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { ProviderName, providersMap } from '@/modules/auth/constants/providers-map.constant';

import { refreshTokenSchema } from './refresh-token.schema';
import { pgTimestamp } from './timestamp';
import { userSchema } from './user.schema';

export const roles = ['user', 'admin'] as const;
export const roleEnum = pgEnum('role', roles);

const providersArray = Object.keys(providersMap) as [ProviderName, ...ProviderName[]];
export const providers = pgEnum('provider', [...providersArray, 'credentials']);
export const type = pgEnum('type', ['oauth', 'credentials']);

export const oauthAccountSchema = pgTable(
  'oauthAccounts',
  {
    accountId: uuid()
      .primaryKey()
      .references(() => accountSchema.id, { onDelete: 'cascade' }),
    providerAccountId: text().notNull(),
    ...pgTimestamp,
  },
  table => ({
    providerAccountIdx: index('oauth_provider_account_idx').on(
      table.providerAccountId,
      table.accountId,
    ),
  }),
);

export const credentialsAccountSchema = pgTable('credentialsAccounts', {
  accountId: uuid()
    .primaryKey()
    .references(() => accountSchema.id, { onDelete: 'cascade' }),
  password: text().notNull(),
  ...pgTimestamp,
});

export const accountSchema = pgTable(
  'accounts',
  {
    id: uuid().defaultRandom().primaryKey(),
    provider: providers().notNull(),
    type: type().notNull(),
    role: roleEnum().notNull(),
    userId: uuid()
      .notNull()
      .references(() => userSchema.id, { onDelete: 'cascade' }),
    ...pgTimestamp,
  },
  table => ({
    userIdIdx: index('accounts_user_id_idx').on(table.userId),
  }),
);

export const accountRelations = relations(accountSchema, ({ one, many }) => ({
  user: one(userSchema, {
    fields: [accountSchema.userId],
    references: [userSchema.id],
  }),
  refreshTokens: many(refreshTokenSchema),
  oauthAccount: one(oauthAccountSchema, {
    fields: [accountSchema.id],
    references: [oauthAccountSchema.accountId],
  }),

  credentialsAccount: one(credentialsAccountSchema, {
    fields: [accountSchema.id],
    references: [credentialsAccountSchema.accountId],
  }),
}));

export type Account = InferSelectModel<typeof accountSchema>;
export type AccountWithRelations = Account & {
  oauthAccount: InferSelectModel<typeof oauthAccountSchema> | null;
  credentialsAccount: InferSelectModel<typeof credentialsAccountSchema> | null;
};

export type OauthAccount = InferSelectModel<typeof oauthAccountSchema>;
export type CredentialsAccount = InferSelectModel<typeof credentialsAccountSchema>;

export type RoleEnum = (typeof roles)[number];
