import { eq, sql } from 'drizzle-orm';
import { DrizzleD1Database } from 'drizzle-orm/d1';

import { dataCounterSchema } from '@/shared/infrastructure/db/schema/data-counter.schema';

interface Deps {
  db: DrizzleD1Database;
}

interface IDataCounterRepository {
  updateCount: (type: 'increment' | 'decrement', tableName: string, tx: DrizzleD1Database) => void;
}

export class DataCounterRepository implements IDataCounterRepository {
  constructor(private readonly deps: Deps) {}

  public async updateCount(type: 'increment' | 'decrement', tableName: string, tx = this.deps.db) {
    const value = type === 'increment' ? 1 : -1;
    await tx
      .update(dataCounterSchema)
      .set({ totalCount: sql`${dataCounterSchema.totalCount} + ${value}` })
      .where(eq(dataCounterSchema.tableName, tableName));
  }

  public async getCount(tableName: string) {
    const result = await this.deps.db
      .select({ totalCount: dataCounterSchema.totalCount })
      .from(dataCounterSchema)
      .where(eq(dataCounterSchema.tableName, tableName));
  }
}
