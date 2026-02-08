import * as argon2 from 'argon2';

import { User } from '@/shared/infrastructure/db/schema/user.schema';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { TokenCommands } from './token/token.commands';
import { TokenService } from './token/token.service';

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
  tokenCommands: TokenCommands;
}

export class AuthCommands {
  constructor(private readonly deps: AuthCommandsDeps) {}

  public async register(input: Omit<User, 'id'>): Promise<RegisterResult> {
    const findUser = await this.deps.userQueries.findByEmail(input.email);
    if (findUser) return { status: 'error', message: 'Пользователь с данным email уже существует' };

    const hashedPassword = await argon2.hash(input.password);

    const createdUser = await this.deps.userCommands.create({ ...input, password: hashedPassword });

    const accessToken = await this.deps.tokenService.sign(createdUser, 'access');
    const refreshToken = await this.deps.tokenService.sign(createdUser, 'refresh');

    await this.deps.tokenCommands.create({
      token: refreshToken.token,
      userId: createdUser.id,
      jti: refreshToken.jti,
      expAt: refreshToken.expAt,
      revokedAt: null,
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

  public async verifyToken<T extends 'access' | 'refresh'>(token: string, type: T) {
    return await this.deps.tokenCommands.verify(token, type);
  }

  public async refresh(userId: string, jti: string) {
    const user = await this.deps.userQueries.findById(userId);

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const refreshToken = await this.deps.tokenCommands.findByJti(jti);

    if (!refreshToken) {
      throw new Error('Токен не найден');
    }

    const accessToken = await this.deps.tokenService.sign(user, 'access');
    return { accessToken: accessToken.token };
  }

  public async findByJti(jti: string) {
    return await this.deps.tokenCommands.findByJti(jti);
  }
}
