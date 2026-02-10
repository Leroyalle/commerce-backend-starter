import * as argon2 from 'argon2';

import { INotificationProducer } from '@/shared/infrastructure/broker/producers/notification.producer';
import { User } from '@/shared/infrastructure/db/schema/user.schema';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { CodeCommands } from './code/code.commands';
import { CodeQueries } from './code/code.queries';
import { TokenCommands } from './token/token.commands';
import { ITokenQueries } from './token/token.queries';
import { TokenService } from './token/token.service';

type RegisterResult = SuccessRegisterResult;
type LoginResult = SuccessLoginResult;

type SuccessLoginResult = {
  status: 'success';
  accessToken: string;
};

type SuccessRegisterResult = SuccessLoginResult & {
  refreshToken: string;
};

export interface Deps {
  userQueries: UserQueries;
  userCommands: UserCommands;
  tokenService: TokenService;
  tokenCommands: TokenCommands;
  tokenQueries: ITokenQueries;
  codeCommands: CodeCommands;
  codeQueries: CodeQueries;
  notificationProducer: INotificationProducer;
}

export class AuthCommands {
  constructor(private readonly deps: Deps) {}

  public async resetPassword(userId: string, newPassword: string) {
    const findUser = await this.deps.userQueries.findById(userId);
    if (!findUser) throw new Error('Пользователь не найден');
    if (findUser.isVerified) throw new Error('Пользователь уже верифицирован');
    const isSame = await argon2.verify(findUser.password, newPassword);

    if (isSame) throw new Error('Новый пароль не должен совпадать со старым');

    const code = await this.deps.codeCommands.create({
      userId: findUser.id,
      type: 'reset_password',
    });

    await this.deps.notificationProducer.sendEmail('reset_password', {
      email: findUser.email,
      code,
    });

    return { success: true };
  }

  public async verifyPasswordCode(userId: string, code: number, newPassword: string) {
    const findUser = await this.deps.userQueries.findById(userId);

    if (!findUser) throw new Error('Пользователь не найден');

    if (findUser.isVerified) throw new Error('Пользователь уже верифицирован');

    const findCode = await this.deps.codeQueries.findByUserId({
      userId: findUser.id,
      type: 'reset_password',
    });

    if (!findCode) throw new Error('Код не найден');
    if (parseInt(findCode) !== code) throw new Error('Неверный код');

    await this.deps.userCommands.update(findUser.id, { password: await argon2.hash(newPassword) });

    return { success: true };
  }

  public async verifyEmailCode(email: string, code: number): Promise<RegisterResult> {
    const findUser = await this.deps.userQueries.findByEmail(email);

    if (!findUser) throw new Error('Пользователь не найден');

    if (findUser.isVerified) throw new Error('Пользователь уже верифицирован');

    const findCode = await this.deps.codeQueries.findByUserId({
      userId: findUser.id,
      type: 'verify_email',
    });

    if (!findCode) throw new Error('Код не найден');
    if (parseInt(findCode) !== code) throw new Error('Неверный код');

    await this.deps.userCommands.update(findUser.id, { isVerified: true });

    const accessToken = await this.deps.tokenService.sign(findUser, 'access');
    const refreshToken = await this.deps.tokenService.sign(findUser, 'refresh');

    await this.deps.tokenCommands.create({
      token: refreshToken.token,
      userId: findUser.id,
      jti: refreshToken.jti,
      expAt: refreshToken.expAt,
      revokedAt: null,
    });

    return { status: 'success', accessToken: accessToken.token, refreshToken: refreshToken.token };
  }

  public async register(
    input: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'role' | 'isVerified'>,
  ): Promise<{ status: 'success' }> {
    const findUser = await this.deps.userQueries.findByEmail(input.email);

    if (findUser) throw new Error('Пользователь уже зарегистрирован');

    const hashedPassword = await argon2.hash(input.password);

    const createdUser = await this.deps.userCommands.create({
      ...input,
      password: hashedPassword,
      isVerified: false,
      role: 'user',
    });

    const code = await this.deps.codeCommands.create({
      userId: createdUser.id,
      type: 'verify_email',
    });

    await this.deps.notificationProducer.sendEmail('verify_email', {
      email: createdUser.email,
      code,
    });

    return { status: 'success' };
  }

  public async login(data: Pick<User, 'email' | 'password'>): Promise<LoginResult> {
    const findUser = await this.deps.userQueries.findByEmail(data.email);

    if (!findUser) throw new Error('Пользователь не найден');

    const isPasswordValid = await argon2.verify(findUser.password, data.password);
    if (!isPasswordValid) throw new Error('Неверный пароль');

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

    const refreshToken = await this.deps.tokenQueries.findByJti(jti);

    if (!refreshToken) {
      throw new Error('Токен не найден');
    }

    await this.deps.tokenCommands.update(refreshToken.id, { revokedAt: new Date() });

    const accessToken = await this.deps.tokenService.sign(user, 'access');
    return { accessToken: accessToken.token };
  }

  public async findByJti(jti: string) {
    return await this.deps.tokenQueries.findByJti(jti);
  }
}
