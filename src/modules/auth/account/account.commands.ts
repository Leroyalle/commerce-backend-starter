import { Account } from '@/shared/infrastructure/db/schema/account.schema';
import { ICreateAccount, IUpdateAccount } from '@/shared/types/auth/create-account.type';

import { IAccountRepository } from './account.repo';

export interface IAccountCommands {
  create(data: Omit<ICreateAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>;
  update(id: string, data: IUpdateAccount): Promise<Account | undefined>;
}

interface Deps {
  repository: IAccountRepository;
}

export class AccountCommands implements IAccountCommands {
  constructor(private readonly deps: Deps) {}

  public create(data: Omit<ICreateAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    return this.deps.repository.create(data);
  }

  public update(id: string, data: IUpdateAccount): Promise<Account | undefined> {
    return this.deps.repository.update(id, data);
  }
}
