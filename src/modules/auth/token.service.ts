import { jwtVerify, SignJWT } from 'jose';

import { RoleEnum } from '@/shared/infrastructure/db/schema/user.schema';
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
  refresh: { jwi: string; expAt: Date };
  access: {
    expAt: Date;
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
    const DAY = 24 * 60 * 60 * 1000;

    const ttl = {
      refresh: 30 + DAY,
      access: 2 * 60 * 60 * 1000,
    };

    const expiresAt = new Date(Date.now() + ttl[type]);

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
        expAt: expiresAt,
      };
    }

    return {
      token,
      jwi: payload.jwi,
      expAt: expiresAt,
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
