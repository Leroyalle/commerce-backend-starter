import { Hono, MiddlewareHandler } from 'hono';

import { AuthVars } from '@/shared/types/auth-variables.type';

import { OrderCommands } from './order.commands';
import { OrderQueries } from './order.queries';

interface Deps {
  queries: OrderQueries;
  commands: OrderCommands;
  accessAuthMiddleware: MiddlewareHandler<{ Variables: AuthVars }>;
}

export function createOrderRouter(deps: Deps): Hono {
  const router = new Hono();

  router.get('/', deps.accessAuthMiddleware, async c => {
    const userId = c.get('userId');
    const result = await deps.queries.findAllByUserId(userId);
    return c.json(result);
  });

  router.post('/', deps.accessAuthMiddleware, async c => {
    const userId = c.get('userId');
    const body = await c.req.json<{ phone: number }>();
    const result = await deps.commands.createOrder(userId, body);
    return c.json(result);
  });

  return router;
}
