import { decodeJwt, jwtVerify, SignJWT } from 'jose';

import { timeMap } from '@/shared/constants/tokens-time-map.constants';
import { RoleEnum } from '@/shared/infrastructure/db/schema/user.schema';
import { SignReturnValue } from '@/shared/types/sign-return-value.type';
import {
  AccessPayload,
  AuthTokensPayload,
  RefreshPayload,
} from '@/shared/types/token-payload.type';

import { JwtConfig } from './jwt.config';

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
        : { type, sub: data.id, jti: crypto.randomUUID() };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('auth-service')
      .setAudience('myapp')
      .setExpirationTime(timeMap[type])
      .sign(this.jwtConfig[type]);

    const decodedToken = decodeJwt(token);
    const expiresAt = new Date(decodedToken.exp! * 1000);

    if (payload.type === 'access') {
      return {
        token,
        expAt: expiresAt,
      };
    }

    return {
      token,
      jti: payload.jti,
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
