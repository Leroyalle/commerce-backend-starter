import * as argon2 from 'argon2';

import { User } from '@/shared/db/schema/user.schema';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { TokenRepo } from './token.repo';
import { TokenService } from './token.service';

type RegisterResult = SuccessRegisterResult | ErrorAuthResult;
type LoginResult = SuccessLoginResult | ErrorAuthResult;

type SuccessLoginResult = {
  status: 'success';
  accessToken: string;
};

type SuccessRegisterResult = SuccessLoginResult & {
  refreshToken: string;
};

type ErrorAuthResult = {
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

    const hashedPassword = await argon2.hash(input.password);

    const createdUser = await this.deps.userCommands.create({ ...input, password: hashedPassword });

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

  public async login(data: Pick<User, 'email' | 'password'>): Promise<LoginResult> {
    const findUser = await this.deps.userQueries.findByEmail(data.email);

    if (!findUser) return { status: 'error', message: 'Пользователь не найден' };

    const isPasswordValid = await argon2.verify(findUser.password, data.password);
    if (!isPasswordValid) return { status: 'error', message: 'Неверный пароль' };

    const accessToken = await this.deps.tokenService.sign(findUser, 'access');
    return { status: 'success', accessToken: accessToken.token };
  }
}
