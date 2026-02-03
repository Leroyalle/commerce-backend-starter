import { jwtVerify, SignJWT } from 'jose';

import { RoleEnum } from '@/shared/db/schema/user.schema';

import { JwtConfig } from './jwt.config';

export class TokenService {
  private readonly timeMap = {
    access: '2h',
    refresh: '30d',
  };

  constructor(private readonly jwtConfig: JwtConfig) {}

  public async sign(data: { id: string; role: RoleEnum }, type: 'refresh' | 'access') {
    const payload = {
      sub: data.id,
      ...(type === 'access' ? { role: data.role } : { jti: crypto.randomUUID() }),
    };

    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('auth-service')
      .setAudience('myapp')
      .setExpirationTime(this.timeMap[type])
      .sign(this.jwtConfig[type]);
  }

  public async verify(token: string, type: 'refresh' | 'access') {
    return await jwtVerify(token, this.jwtConfig[type], {
      issuer: 'auth-service',
      audience: 'myapp',
    });
  }
}
