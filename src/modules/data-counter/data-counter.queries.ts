import { IDataCounterRepository } from './data-counter.repo';

interface Deps {
  repository: IDataCounterRepository;
}

export interface IDataCounterQueries {
  getCount: (tableName: string) => Promise<number>;
}

export class DataCounterQueries implements IDataCounterQueries {
  constructor(private readonly deps: Deps) {}

  public getCount(tableName: string) {
    return this.deps.repository.getCount(tableName);
  }
}
