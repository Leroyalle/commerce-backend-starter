import { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

import { AuthCommands } from '@/modules/auth/auth.commands';
import { AuthVars } from '@/shared/types/auth-variables.type';

export function accessAuthGuard(
  authCommands: AuthCommands,
): MiddlewareHandler<{ Variables: AuthVars }> {
  return async (c, next): Promise<Response | void> => {
    const accessToken = getCookie(c, 'accessToken');

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const payload = await authCommands.verifyToken(accessToken, 'access');

      if (!payload.payload.sub) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      c.set('userId', payload.payload.sub);
      c.set('role', payload.payload.role);

      await next();
    } catch (error: any) {
      if (error?.code === 'ERR_JWT_EXPIRED') {
        return c.json(
          {
            error: 'Token expired',
            message: 'Пожалуйста, авторизуйтесь заново',
          },
          401,
        );
      }
    }
  };
}
