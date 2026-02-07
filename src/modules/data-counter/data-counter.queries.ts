import { IDataCounterRepository } from './data-counter.repo';

interface Deps {
  repository: IDataCounterRepository;
}

export class DataCounterQueries {
  constructor(private readonly deps: Deps) {}

  public getCount(tableName: string) {
    return this.deps.repository.getCount(tableName);
  }
}
