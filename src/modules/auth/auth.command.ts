import { User } from '@/shared/db/schema/user.schema';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { TokenRepo } from './token.repo';
import { TokenService } from './token.service';

export interface AuthCommandsDeps {
  userQueries: UserQueries;
  userCommands: UserCommands;
  tokenService: TokenService;
  tokenRepo: TokenRepo;
}

export class AuthCommands {
  constructor(private readonly deps: AuthCommandsDeps) {}

  public async register(input: Omit<User, 'id'>): { status: 'success' | 'error'; message: string } {
    const findUser = await this.deps.userQueries.findByEmail(input.email);
    if (!findUser)
      return { status: 'error', message: 'Пользователь с данным email уже существует' };

    const createdUser = await this.deps.userCommands.create(input);

    const accessToken = await this.deps.tokenService.sign(createdUser, 'access');
    const refreshToken = await this.deps.tokenService.sign(createdUser, 'refresh');

    const createdRefreshToken = this.deps.tokenRepo.create({
      token: refreshToken.token,
      jwi: refreshToken.jwi,
      expAt: refreshToken.expAt,
    });

    return { status: 'success', message: 'Вы успешно зарегестрированы!' };
  }

  // public authorize() {}
}
