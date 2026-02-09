import { DB } from '@/shared/infrastructure/db/client';

import { IDataCounterRepository } from './data-counter.repo';

interface Deps {
  repository: IDataCounterRepository;
}

export interface IDataCounterCommands {
  updateCount: (type: 'increment' | 'decrement', tableName: string, tx?: DB) => Promise<void>;
}

export class DataCounterCommands implements IDataCounterCommands {
  constructor(private readonly deps: Deps) {}

  public async updateCount(type: 'increment' | 'decrement', tableName: string, tx?: DB) {
    return await this.deps.repository.updateCount(type, tableName, tx);
  }
}
