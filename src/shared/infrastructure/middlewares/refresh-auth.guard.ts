import { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';

import { AuthCommands } from '@/modules/auth/auth.command';
import { RefreshAuthVars } from '@/shared/types/auth-variables.type';

export function refreshGuard(
  authCommands: AuthCommands,
): MiddlewareHandler<{ Variables: RefreshAuthVars }> {
  return async (c, next) => {
    const refreshTokenCookie = getCookie(c, 'refreshToken');

    if (!refreshTokenCookie) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { payload } = await authCommands.verifyToken(refreshTokenCookie, 'refresh');

    const refreshToken = await authCommands.findByJti(payload.jti);

    if (!refreshToken || refreshToken.revokedAt) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('jti', payload.jti);
    c.set('userId', payload.sub);
    // c.set('role', payload.role);

    return next();
  };
}
