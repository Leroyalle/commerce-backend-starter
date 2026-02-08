import { zValidator } from '@hono/zod-validator';
import { Hono, MiddlewareHandler } from 'hono';

import { paramsZodSchema } from '@/shared/infrastructure/zod/params.schema';
import { AuthVars } from '@/shared/types/auth-variables.type';

import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';

type CreateUserRouterDeps = {
  commands: UserCommands;
  queries: UserQueries;
  accessAuthMiddleware: MiddlewareHandler<{
    Variables: AuthVars;
  }>;
};

export function createUserRouter(deps: CreateUserRouterDeps): Hono {
  const userRouter = new Hono();

  userRouter.get('/:id', zValidator('param', paramsZodSchema), c => {
    const id = c.req.valid('param');
    const data = deps.queries.findById(id);
    return c.json(data);
  });

  userRouter.get('/me', deps.accessAuthMiddleware, c => {
    const id = c.get('userId');
    const data = deps.queries.findById(id);
    return c.json(data);
  });

  return userRouter;
}
