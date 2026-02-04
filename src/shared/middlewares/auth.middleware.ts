import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { JWTPayload, JWTVerifyResult } from 'jose';

export function authMiddleware(
  verifyToken: (token: string, type: 'access') => Promise<JWTVerifyResult<JWTPayload>>,
) {
  return async (c: Context, next: Function): Promise<Response | void> => {
    const accessToken = getCookie(c, 'accessToken');

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const payload = await verifyToken(accessToken, 'access');

    if (!payload.payload.sub) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await next();
  };
}
