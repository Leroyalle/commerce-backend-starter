import { InferSelectModel, relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { RefreshToken, refreshTokenSchema } from './refresh-token.schema';

export const roles = ['user', 'admin'] as const;
export const roleEnum = pgEnum('role', roles);

export const userSchema = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  username: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  phone: integer().notNull(),
  role: roleEnum().notNull(),
});

export const userRelation = relations(userSchema, ({ many }) => ({
  refreshTokens: many(refreshTokenSchema),
}));

export type User = InferSelectModel<typeof userSchema>;
export type RoleEnum = (typeof roles)[number];
