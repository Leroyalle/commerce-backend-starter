import { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { JWTHeaderParameters, JWTPayload } from 'jose';

import { AuthVars } from '@/shared/types/auth-variables.type';
import { AccessPayload, RefreshPayload } from '@/shared/types/token-payload.type';

export function accessAuthGuard(
  verifyToken: <T extends 'access' | 'refresh'>(
    token: string,
    type: T,
  ) => Promise<{
    payload: JWTPayload & (T extends 'access' ? AccessPayload : RefreshPayload);
    protectedHeader: JWTHeaderParameters;
  }>,
): MiddlewareHandler<{ Variables: AuthVars }> {
  return async (c, next): Promise<Response | void> => {
    const accessToken = getCookie(c, 'accessToken');

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const payload = await verifyToken(accessToken, 'access');

    if (!payload.payload.sub) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('userId', payload.payload.sub);
    c.set('role', payload.payload.role);

    await next();
  };
}
