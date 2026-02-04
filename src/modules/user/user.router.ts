import { Hono } from 'hono';
import { JWTPayload, JWTVerifyResult } from 'jose';

import { authMiddleware } from '@/shared/middlewares/auth.middleware';

import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';

export function createUserRouter(
  commands: UserCommands,
  queries: UserQueries,
  verifyAccess: (token: string, type: 'access') => Promise<JWTVerifyResult<JWTPayload>>,
): Hono {
  const userRouter = new Hono();

  const requireAuth = authMiddleware(verifyAccess);

  userRouter.get('/:id', requireAuth, c => {
    const id = c.req.param('id');
    const data = queries.findById(id);
    return c.json(data);
  });

  return userRouter;
}
