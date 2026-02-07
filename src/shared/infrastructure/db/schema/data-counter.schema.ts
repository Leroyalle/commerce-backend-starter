import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const dataCounterSchema = pgTable('data-counter', {
  name: varchar().notNull(),
  counter: integer().notNull(),
});
