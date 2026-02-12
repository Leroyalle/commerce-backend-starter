import { OauthAccount } from '@/shared/infrastructure/db/schema/oauth-account.schema';

import { IOauthRepository } from './oauth.repo';

export interface IOauthQueries {
  findById(id: string): Promise<OauthAccount | undefined>;
}

interface Deps {
  repository: IOauthRepository;
}

export class OauthQueries implements IOauthQueries {
  constructor(private readonly deps: Deps) {}

  public findById(id: string): Promise<OauthAccount | undefined> {
    return this.deps.repository.findById(id);
  }
}
