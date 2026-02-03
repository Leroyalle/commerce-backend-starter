import { jwtVerify, SignJWT } from 'jose';

import { RoleEnum } from '@/shared/db/schema/user.schema';

import { JwtConfig } from './jwt.config';

const timeMap = {
  access: '2h',
  refresh: '30d',
} as const;

type AccessPayload = {
  type: 'access';
  sub: string;
  role: RoleEnum;
};

type RefreshPayload = {
  type: 'refresh';
  sub: string;
  jwi: string;
};

type Payload = AccessPayload | RefreshPayload;

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
    const payload: Payload =
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

  public async verify(token: string, type: 'refresh' | 'access') {
    return await jwtVerify(token, this.jwtConfig[type], {
      issuer: 'auth-service',
      audience: 'myapp',
    });
  }
}
