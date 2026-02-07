import { RefreshToken } from '@/shared/infrastructure/db/schema/refresh-token.schema';

import { TokenRepo } from './token.repo';
import { TokenService } from './token.service';

type TokenCommandsDeps = {
  tokenRepo: TokenRepo;
  tokenService: TokenService;
};

export class TokenCommands {
  constructor(private readonly deps: TokenCommandsDeps) {}

  public async create(token: Omit<RefreshToken, 'id'>) {
    return await this.deps.tokenRepo.create(token);
  }

  public async verify<T extends 'access' | 'refresh'>(token: string, type: T) {
    return await this.deps.tokenService.verify(token, type);
  }

  public async findValidByUserId(userId: string) {
    return await this.deps.tokenRepo.findValidByUserId(userId);
  }
}
