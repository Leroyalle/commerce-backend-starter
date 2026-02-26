import { eq, sql } from 'drizzle-orm';

import { DB } from '@/shared/infrastructure/db/client';
import { dataCounterSchema } from '@/shared/infrastructure/db/schemes/data-counter.schema';

interface Deps {
  db: DB;
}

export interface IDataCounterRepository {
  updateCount: (type: 'increment' | 'decrement', tableName: string, tx?: DB) => Promise<void>;
  getCount: (tableName: string) => Promise<number>;
}

export class DataCounterRepository implements IDataCounterRepository {
  constructor(private readonly deps: Deps) {}

  public async updateCount(
    type: 'increment' | 'decrement',
    tableName: string,
    tx: DB = this.deps.db,
  ) {
    const value = type === 'increment' ? 1 : -1;
    await tx
      .insert(dataCounterSchema)
      .values({ tableName, totalCount: type === 'increment' ? 1 : 0 })
      .onConflictDoUpdate({
        target: dataCounterSchema.tableName,
        set: {
          totalCount: sql`GREATEST(${dataCounterSchema.totalCount} + ${value}, 0)`,
        },
      });
  }

  public async getCount(tableName: string) {
    const result = await this.deps.db
      .select({ totalCount: dataCounterSchema.totalCount })
      .from(dataCounterSchema)
      .where(eq(dataCounterSchema.tableName, tableName))
      .limit(1);

    return result?.[0]?.totalCount ?? 0;
  }
}
