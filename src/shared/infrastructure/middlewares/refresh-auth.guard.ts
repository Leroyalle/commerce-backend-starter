import { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

import { AuthCommands } from '@/modules/auth/auth.commands';
import { IAuthQueries } from '@/modules/auth/auth.queries';
import { UserQueries } from '@/modules/user/user.queries';
import { RefreshAuthVars } from '@/shared/types/auth-variables.type';

export function refreshGuard(
  authCommands: AuthCommands,
  authQueries: IAuthQueries,
  userQueries: UserQueries,
): MiddlewareHandler<{ Variables: RefreshAuthVars }> {
  return async (c, next) => {
    const refreshTokenCookie = getCookie(c, 'refreshToken');

    if (!refreshTokenCookie) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { payload } = await authCommands.verifyToken(refreshTokenCookie, 'refresh');

    const refreshToken = await authQueries.findByJti(payload.jti);

    if (!refreshToken || refreshToken.revokedAt) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const account = await authQueries.findAccountById(payload.sub);

    if (!account || !account.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const user = await userQueries.findById(account.userId);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('jti', payload.jti);
    c.set('user', user);
    c.set('accountId', account.id);

    return next();
  };
}
