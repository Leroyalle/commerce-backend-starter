import { Account } from '@/shared/infrastructure/db/schema/account.schema';
import { RefreshToken } from '@/shared/infrastructure/db/schema/refresh-token.schema';

import { IAccountQueries } from './account/account.queries';
import { ITokenQueries } from './token/token.queries';

export interface IAuthQueries {
  findByJti(jti: string): Promise<RefreshToken | undefined>;
  findAccountById(id: string): Promise<Account | undefined>;
}

interface Deps {
  tokenQueries: ITokenQueries;
  accountQueries: IAccountQueries;
}

export class AuthQueries implements IAuthQueries {
  constructor(private readonly deps: Deps) {}

  public findByJti(jti: string): Promise<RefreshToken | undefined> {
    return this.deps.tokenQueries.findByJti(jti);
  }

  public findAccountById(id: string): Promise<Account | undefined> {
    return this.deps.accountQueries.findById(id);
  }
}
