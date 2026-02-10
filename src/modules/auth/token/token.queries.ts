import { RefreshToken } from '@/shared/infrastructure/db/schema/refresh-token.schema';

import { ITokenRepository } from './token.repo';

interface Deps {
  tokenRepo: ITokenRepository;
}

export interface ITokenQueries {
  findValidByUserId: (userId: string) => Promise<RefreshToken | undefined>;
  findByJti: (jti: string) => Promise<RefreshToken | undefined>;
}

export class TokenQueries implements ITokenQueries {
  constructor(private readonly deps: Deps) {}

  public async findValidByUserId(userId: string) {
    return await this.deps.tokenRepo.findValidByUserId(userId);
  }
  public async findByJti(jti: string) {
    return await this.deps.tokenRepo.findByJti(jti);
  }
}
