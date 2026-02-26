import { AccountWithRelations } from '@/shared/infrastructure/db/schemes/account.schema';

import { ProviderName } from '../constants/providers-map.constant';

import { IAccountRepository } from './account.repo';

export interface IAccountQueries {
  findByProviderAccount(
    providerName: ProviderName,
    id: string,
  ): Promise<Omit<AccountWithRelations, 'credentialsAccount'> | undefined>;
  findById(id: string): Promise<AccountWithRelations | undefined>;
}

interface Deps {
  repository: IAccountRepository;
}

export class AccountQueries implements IAccountQueries {
  constructor(private readonly deps: Deps) {}

  public findById(id: string): Promise<AccountWithRelations | undefined> {
    return this.deps.repository.findById(id);
  }

  public findByProviderAccount(
    providerName: ProviderName,
    id: string,
  ): Promise<Omit<AccountWithRelations, 'credentialsAccount'> | undefined> {
    return this.deps.repository.findByProviderAccount(providerName, id);
  }
}
