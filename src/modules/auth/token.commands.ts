import { RefreshToken } from '@/shared/db/schema/refresh-token.schema';

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

  public async verify(token: string, type: 'access' | 'refresh') {
    return await this.deps.tokenService.verify(token, type);
  }
}
