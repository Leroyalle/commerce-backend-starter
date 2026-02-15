import { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

import { AuthCommands } from '@/modules/auth/auth.commands';
import { UserQueries } from '@/modules/user/user.queries';
import { AuthVars } from '@/shared/types/auth-variables.type';

export function accessAuthGuard(
  authCommands: AuthCommands,
  userQueries: UserQueries,
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

      const account = await authCommands.findAccountById(payload.payload.sub);

      if (!account || !account.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const user = await userQueries.findById(account.userId);

      if (!user || !user.emailVerifiedAt) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      c.set('user', user);
      c.set('role', account.role);
      c.set('accountId', account.id);

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
