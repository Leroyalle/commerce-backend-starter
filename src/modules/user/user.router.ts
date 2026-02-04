import { Hono } from 'hono';
import { JWTHeaderParameters, JWTPayload } from 'jose';

import { authMiddleware } from '@/shared/middlewares/auth.middleware';
import { AccessPayload, RefreshPayload } from '@/shared/types/token-payload.type';

import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';

type CreateUserRouterDeps = {
  commands: UserCommands;
  queries: UserQueries;
  verifyToken: <T extends 'access' | 'refresh'>(
    token: string,
    type: T,
  ) => Promise<{
    payload: JWTPayload & (T extends 'access' ? AccessPayload : RefreshPayload);
    protectedHeader: JWTHeaderParameters;
  }>;
};

export function createUserRouter(deps: CreateUserRouterDeps): Hono {
  const userRouter = new Hono();

  const requireAuth = authMiddleware(deps.verifyToken);

  userRouter.get('/:id', c => {
    const id = c.req.param('id');
    const data = deps.queries.findById(id);
    return c.json(data);
  });

  userRouter.get('/me', requireAuth, c => {
    const id = c.get('userId');
    const data = deps.queries.findById(id);
    return c.json(data);
  });

  return userRouter;
}
