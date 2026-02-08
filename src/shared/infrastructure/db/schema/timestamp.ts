import { timestamp } from 'drizzle-orm/pg-core';

export const pgTimestamp = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
};
