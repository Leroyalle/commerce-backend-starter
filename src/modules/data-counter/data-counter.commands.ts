import { DB } from '@/shared/infrastructure/db/client';

import { IDataCounterRepository } from './data-counter.repo';

interface Deps {
  repository: IDataCounterRepository;
}

export class DataCounterCommands {
  constructor(private readonly deps: Deps) {}

  public updateCount(type: 'increment' | 'decrement', tableName: string, tx?: DB) {
    return this.deps.repository.updateCount(type, tableName, tx);
  }
}
