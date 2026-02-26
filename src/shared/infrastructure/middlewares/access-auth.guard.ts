import { MiddlewareHandler } from 'hono';

import { AuthCommands } from '@/modules/auth/auth.commands';
import { UserQueries } from '@/modules/user/user.queries';
import { AuthVars } from '@/shared/types/auth-variables.type';

export function accessAuthGuard(
  authCommands: AuthCommands,
  userQueries: UserQueries,
): MiddlewareHandler<{ Variables: AuthVars }> {
  return async (c, next): Promise<Response | void> => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const accessToken = token;

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

      return await next();
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

      return c.json({ error: 'Unauthorized' }, 401);
    }
  };
}
