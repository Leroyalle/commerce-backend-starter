import { jwtVerify, SignJWT } from 'jose';

import { RoleEnum } from '@/shared/db/schema/user.schema';
import {
  AccessPayload,
  AuthTokensPayload,
  RefreshPayload,
} from '@/shared/types/token-payload.type';

import { JwtConfig } from './jwt.config';

const timeMap = {
  access: '2h',
  refresh: '30d',
} as const;

type SignReturnValue<T extends keyof typeof timeMap> = {
  token: string;
} & SignReturnMap[T];

type SignReturnMap = {
  refresh: { jwi: string; expAt: (typeof timeMap)['refresh'] };
  access: {
    expAt: (typeof timeMap)['access'];
  };
};

export class TokenService {
  constructor(private readonly jwtConfig: JwtConfig) {}

  public async sign(
    data: { id: string; role: RoleEnum },
    type: 'refresh',
  ): Promise<SignReturnValue<'refresh'>>;
  public async sign(
    data: { id: string; role: RoleEnum },
    type: 'access',
  ): Promise<SignReturnValue<'access'>>;
  public async sign(
    data: { id: string; role: RoleEnum },
    type: keyof typeof timeMap,
  ): Promise<SignReturnValue<'access'> | SignReturnValue<'refresh'>> {
    const payload: AuthTokensPayload =
      type === 'access'
        ? { type, sub: data.id, role: data.role }
        : { type, sub: data.id, jwi: crypto.randomUUID() };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('auth-service')
      .setAudience('myapp')
      .setExpirationTime(timeMap[type])
      .sign(this.jwtConfig[type]);

    if (payload.type === 'access') {
      return {
        token,
        expAt: timeMap[payload.type],
      };
    }

    return {
      token,
      jwi: payload.jwi,
      expAt: timeMap[payload.type],
    };
  }

  public async verify<T extends keyof typeof timeMap>(token: string, type: T) {
    return await jwtVerify<T extends 'access' ? AccessPayload : RefreshPayload>(
      token,
      this.jwtConfig[type],
      {
        issuer: 'auth-service',
        audience: 'myapp',
      },
    );
  }
}
