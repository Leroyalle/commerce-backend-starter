import * as argon2 from 'argon2';

import {
  AlreadyExistsException,
  InvalidCodeException,
  InvalidPasswordException,
  NotFoundException,
  SamePasswordException,
  UserAlreadyVerifiedException,
  UserNotVerifiedException,
} from '@/shared/exceptions/exceptions';
import { INotificationProducer } from '@/shared/infrastructure/broker/producers/notification.producer';
import { Account } from '@/shared/infrastructure/db/schema/account.schema';
import { User } from '@/shared/infrastructure/db/schema/user.schema';
import { isGithubResponse } from '@/shared/lib/guards/is-github-response.guard';
import { isYandexResponse } from '@/shared/lib/guards/is-yandex-response.guard';
import { SuccessAuthResult } from '@/shared/types/auth-result.type';

import { UserCommands } from '../user/user.commands';
import { UserQueries } from '../user/user.queries';

import { IAccountCommands } from './account/account.commands';
import { IAccountQueries } from './account/account.queries';
import { CodeCommands } from './code/code.commands';
import { CodeQueries } from './code/code.queries';
import { TProvidersInfoMapConstant } from './constants/providers-info-map.constant';
import { ProviderName, providersMap } from './constants/providers-map.constant';
import { providersScopeMap } from './constants/providers-scope-map.constant';
import { providersUrlMap } from './constants/providers-url-map.constant';
import { LoginDto } from './schemas/login.schema';
import { RegisterDto } from './schemas/register.schema';
import { TokenCommands } from './token/token.commands';
import { ITokenQueries } from './token/token.queries';
import { TokenService } from './token/token.service';

export interface Deps {
  userQueries: UserQueries;
  userCommands: UserCommands;
  tokenService: TokenService;
  tokenCommands: TokenCommands;
  tokenQueries: ITokenQueries;
  codeCommands: CodeCommands;
  codeQueries: CodeQueries;
  notificationProducer: INotificationProducer;
  accountQueries: IAccountQueries;
  accountCommands: IAccountCommands;
}

export class AuthCommands {
  constructor(private readonly deps: Deps) {}

  public async resetPassword(user: User, accountId: string, newPassword: string) {
    const account = await this.deps.accountQueries.findById(accountId);

    if (!account) throw NotFoundException.Account();

    if (account.credentialsAccount?.password) {
      const isSame = await argon2.verify(account.credentialsAccount.password, newPassword);
      if (isSame) throw new SamePasswordException('Новый пароль не должен совпадать со старым');
    }

    const code = await this.deps.codeCommands.create({
      accountId: account.id,
      type: 'reset_password',
    });

    await this.deps.notificationProducer.sendEmail('reset_password', {
      email: user.email,
      code,
    });

    return { success: true };
  }

  public async verifyPasswordCode(
    user: User,
    accountId: string,
    code: number,
    newPassword: string,
  ) {
    const account = await this.deps.accountQueries.findById(accountId);

    if (!account) throw NotFoundException.Account();

    const findCode = await this.deps.codeQueries.findByUserId({
      accountId: account.id,
      type: 'reset_password',
    });

    if (!findCode) throw NotFoundException.Code();
    if (parseInt(findCode) !== code) throw new InvalidCodeException('Неверный код');

    const hashedPassword = await argon2.hash(newPassword);

    if (!account.credentialsAccount) {
      await this.deps.accountCommands.create({
        account: {
          role: 'user',
          type: 'credentials',
          userId: user.id,
          provider: 'credentials',
        },
        providerDetails: {
          isVerified: true,
          type: 'credentials',
          password: hashedPassword,
        },
      });
    } else {
      await this.deps.accountCommands.update(account.id, {
        providerDetails: {
          type: 'credentials',
          isVerified: true,
          password: hashedPassword,
        },
      });
    }

    // await this.deps.userCommands.update(findUser.id, { password: await argon2.hash(newPassword) });

    return { success: true };
  }

  public async verifyEmailCode(email: string, code: number): Promise<SuccessAuthResult> {
    const findUser = await this.deps.userQueries.findByEmail(email);

    if (!findUser) throw NotFoundException.User();
    const account = findUser.accounts.find(acc => acc.credentialsAccount);
    const credentialsAccount = account?.credentialsAccount;

    if (!account) throw NotFoundException.Account();

    if (credentialsAccount?.isVerified)
      throw new UserAlreadyVerifiedException('Пользователь уже верифицирован');

    const findCode = await this.deps.codeQueries.findByUserId({
      accountId: account.id,
      type: 'verify_email',
    });

    if (!findCode) throw NotFoundException.Code();
    if (parseInt(findCode) !== code) throw new InvalidCodeException('Неверный код');

    await this.deps.accountCommands.update(account.id, {
      providerDetails: {
        isVerified: true,
        type: 'credentials',
      },
    });

    const accessToken = await this.deps.tokenService.sign(
      {
        id: account.id,
        role: account.role,
      },
      'access',
    );
    const refreshToken = await this.deps.tokenService.sign(
      {
        id: account.id,
        role: account.role,
      },
      'refresh',
    );

    await this.deps.tokenCommands.create({
      token: refreshToken.token,
      accountId: account.id,
      jti: refreshToken.jti,
      expAt: refreshToken.expAt,
      revokedAt: null,
    });

    return { status: 'success', accessToken, refreshToken };
  }

  public async register(input: RegisterDto): Promise<{ status: 'success' }> {
    const findUser = await this.deps.userQueries.findByEmail(input.email);

    if (findUser) throw AlreadyExistsException.User();

    const hashedPassword = await argon2.hash(input.password);

    const createdUser = await this.deps.userCommands.create(input);

    const account = await this.deps.accountCommands.create({
      account: {
        provider: 'credentials',
        type: 'credentials',
        role: 'user',
        userId: createdUser.id,
      },
      providerDetails: {
        isVerified: false,
        type: 'credentials',
        password: hashedPassword,
      },
    });

    const code = await this.deps.codeCommands.create({
      accountId: account.id,
      type: 'verify_email',
    });

    await this.deps.notificationProducer.sendEmail('verify_email', {
      email: createdUser.email,
      code,
    });

    return { status: 'success' };
  }

  public async login(data: LoginDto): Promise<SuccessAuthResult> {
    const findUser = await this.deps.userQueries.findByEmail(data.email);

    if (!findUser) throw NotFoundException.User();

    const account = findUser.accounts.find(acc => acc.credentialsAccount);
    const credentialsAccount = account?.credentialsAccount;

    if (!account) throw NotFoundException.Account();

    if (!credentialsAccount?.isVerified)
      throw new UserNotVerifiedException('Аккаунт не верефецирован');

    const isPasswordValid = await argon2.verify(credentialsAccount.password, data.password);
    if (!isPasswordValid) throw new InvalidPasswordException('Неверный пароль');

    const refreshToken = await this.deps.tokenService.sign(account, 'refresh');
    const accessToken = await this.deps.tokenService.sign(account, 'access');

    await this.deps.tokenCommands.create({
      token: refreshToken.token,
      accountId: account.id,
      jti: refreshToken.jti,
      expAt: refreshToken.expAt,
      revokedAt: null,
    });
    return { status: 'success', accessToken, refreshToken };
  }

  public async verifyToken<T extends 'access' | 'refresh'>(token: string, type: T) {
    return await this.deps.tokenCommands.verify(token, type);
  }

  public async findAccountById(id: string) {
    return await this.deps.accountQueries.findById(id);
  }

  public async refresh(accountId: string, jti: string) {
    const account = await this.deps.accountQueries.findById(accountId);

    if (!account || !account.userId) throw NotFoundException.Account();

    const user = await this.deps.userQueries.findById(account.userId);

    if (!user) throw NotFoundException.User();

    const findRefresh = await this.deps.tokenQueries.findByJti(jti);

    if (!findRefresh) throw NotFoundException.Token();

    await this.deps.tokenCommands.update(findRefresh.id, { revokedAt: new Date() });

    const refreshToken = await this.deps.tokenService.sign(account, 'refresh');
    const accessToken = await this.deps.tokenService.sign(account, 'access');

    await this.deps.tokenCommands.create({
      token: refreshToken.token,
      accountId,
      jti: refreshToken.jti,
      expAt: refreshToken.expAt,
      revokedAt: null,
    });
    return { accessToken, refreshToken };
  }

  public oauthLogin(providerName: ProviderName) {
    const state = crypto.randomUUID();
    const provider = providersMap[providerName];
    const scope = providersScopeMap[providerName];
    const url = provider.createAuthorizationURL(state, scope);

    return { url, state };
  }

  public async oauthLoginCallback(
    providerName: ProviderName,
    data: { code: string; state: string; storedState: string },
  ) {
    const { code, storedState, state } = data;
    if (!code || !state || state !== storedState) {
      throw new InvalidCodeException('Invalid code or state');
    }

    const provider = providersMap[providerName];
    const userFetchUrl = providersUrlMap[providerName];

    const tokens = await provider.validateAuthorizationCode(code);
    const oauthAccessToken = tokens.accessToken();

    const response = await this.getUserOauthData({
      providerName,
      accessToken: oauthAccessToken,
      url: userFetchUrl,
    });

    if (!response) {
      throw NotFoundException.User();
    }

    let account: Account | undefined = undefined;

    if (isGithubResponse(response)) {
      account = await this.findAndUpdateAccount({
        displayName: response.displayName,
        email: response.email,
        providerId: response.externalId,
        providerName,
      });
    }

    if (isYandexResponse(response)) {
      account = await this.findAndUpdateAccount({
        displayName: response.first_name,
        email: response.default_email,
        providerId: response.id,
        providerName,
      });
    }

    if (!account) throw NotFoundException.Account();

    const accessToken = await this.deps.tokenService.sign(account, 'access');
    const refreshToken = await this.deps.tokenService.sign(account, 'refresh');

    return { status: 'success', accessToken, refreshToken };
  }

  private async findAndUpdateAccount(response: {
    providerId: string;
    displayName: string;
    email: string;
    providerName: ProviderName;
  }): Promise<Account | undefined> {
    const oauthAccount = await this.deps.accountQueries.findByProviderId(response.providerId);
    if (oauthAccount) {
      await this.deps.userCommands.update(oauthAccount.userId, {
        name: response.displayName,
      });

      return oauthAccount;
    }
    if (!oauthAccount) {
      const findUser = await this.deps.userCommands.create({
        email: response.email,
        name: response.displayName,
      });

      console.log('after user create');
      const acc = await this.deps.accountCommands.create({
        providerDetails: {
          providerAccountId: response.providerId,
          type: 'oauth',
        },
        account: {
          type: 'oauth',
          userId: findUser.id,
          provider: response.providerName,
          role: 'user',
        },
      });

      console.log('after account create', acc);
      return acc;
    }
  }

  public async getUserOauthData<T extends keyof TProvidersInfoMapConstant>(data: {
    providerName: T;
    accessToken: string;
    url: string;
  }): Promise<TProvidersInfoMapConstant[T] | undefined> {
    const { accessToken, providerName, url } = data;
    const response = await fetch(url, {
      headers: {
        Authorization: `OAuth ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Yandex API error: ${response.status} ${errorText}`);
    }

    switch (providerName) {
      case 'Yandex':
        return (await response.json()) as TProvidersInfoMapConstant[T];
    }
  }
  // public async findByJti(jti: string) {
  //   return await this.deps.tokenQueries.findByJti(jti);
  // }
}
