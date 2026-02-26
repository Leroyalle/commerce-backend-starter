import { MiddlewareHandler } from 'hono';

import { AuthCommands } from '@/modules/auth/auth.commands';
import { UserQueries } from '@/modules/user/user.queries';
import { AuthVars } from '@/shared/types/auth-variables.type';

export function optionalAccessAuthGuard(
  authCommands: AuthCommands,
  userQueries: UserQueries,
): MiddlewareHandler<{ Variables: Partial<AuthVars> }> {
  return async (c, next): Promise<Response | void> => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      return await next();
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return await next();
    }

    try {
      const payload = await authCommands.verifyToken(token, 'access');
      if (!payload.payload.sub) {
        return await next();
      }

      const account = await authCommands.findAccountById(payload.payload.sub);
      if (!account || !account.userId) {
        return await next();
      }

      const user = await userQueries.findById(account.userId);
      if (!user || !user.emailVerifiedAt) {
        return await next();
      }

      c.set('user', user);
      c.set('role', account.role);
      c.set('accountId', account.id);
    } catch {}

    await next();
  };
}
