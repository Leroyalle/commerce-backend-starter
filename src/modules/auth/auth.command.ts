import { User } from '@/shared/db/schema/user.schema';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { TokenRepo } from './token.repo';
import { TokenService } from './token.service';

type RegisterResult = SuccessRegisterResult | ErrorRegisterResult;

type SuccessRegisterResult = {
  status: 'success';
  refreshToken: string;
  accessToken: string;
};

type ErrorRegisterResult = {
  status: 'error';
  message: string;
};

export interface AuthCommandsDeps {
  userQueries: UserQueries;
  userCommands: UserCommands;
  tokenService: TokenService;
  tokenRepo: TokenRepo;
}

export class AuthCommands {
  constructor(private readonly deps: AuthCommandsDeps) {}

  public async register(input: Omit<User, 'id'>): Promise<RegisterResult> {
    const findUser = await this.deps.userQueries.findByEmail(input.email);
    if (!findUser)
      return { status: 'error', message: 'Пользователь с данным email уже существует' };

    const createdUser = await this.deps.userCommands.create(input);

    const accessToken = await this.deps.tokenService.sign(createdUser, 'access');
    const refreshToken = await this.deps.tokenService.sign(createdUser, 'refresh');

    await this.deps.tokenRepo.create({
      token: refreshToken.token,
      userId: createdUser.id,
      jwi: refreshToken.jwi,
      expAt: refreshToken.expAt,
    });

    return { status: 'success', accessToken: accessToken.token, refreshToken: refreshToken.token };
  }
}
