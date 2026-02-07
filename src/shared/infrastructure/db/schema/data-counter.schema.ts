import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const dataCounterSchema = pgTable('data-counter', {
  tableName: varchar().notNull(),
  totalCount: integer().notNull(),
});
