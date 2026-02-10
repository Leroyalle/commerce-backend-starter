import { zValidator } from '@hono/zod-validator';
import { Hono, MiddlewareHandler } from 'hono';

import { AuthVars } from '@/shared/types/auth-variables.type';

import { paramsZodSchema } from '../../shared/infrastructure/zod/params.schema';

import { CartCommands } from './cart.commands';
import { CartQueries } from './cart.queries';
import { addItemZodSchema } from './schemas/add-item.schema';

interface Deps {
  commands: CartCommands;
  queries: CartQueries;
  accessAuthMiddleware: MiddlewareHandler<{ Variables: AuthVars }>;
}

export function createCartRouter(deps: Deps): Hono {
  const router = new Hono();

  router.get('/', deps.accessAuthMiddleware, async c => {
    const userId = c.get('userId');
    const data = await deps.queries.findByUserId(userId);
    if (!data) {
      return c.json({ error: 'Cart not found' }, 404);
    }
    return c.json(data);
  });

  router.post(
    '/items',
    deps.accessAuthMiddleware,
    zValidator('json', addItemZodSchema),
    async c => {
      const userId = c.get('userId');
      const body = c.req.valid('json');
      const data = await deps.commands.addItem(userId, body.productId, body.quantity);
      return c.json(data);
    },
  );

  router.delete(
    '/items/:id',
    deps.accessAuthMiddleware,
    zValidator('param', paramsZodSchema),
    async c => {
      const params = c.req.valid('param');
      const userId = c.get('userId');
      const data = await deps.commands.removeItem(userId, params.id);
      return c.json(data);
    },
  );

  router.put(
    '/items/:id',
    deps.accessAuthMiddleware,
    zValidator('param', paramsZodSchema),
    async c => {
      const userId = c.get('userId');
      const params = c.req.valid('param');
      const data = await deps.commands.decrementItem(userId, params.id);
      return c.json(data);
    },
  );

  router.delete('/', deps.accessAuthMiddleware, async c => {
    const userId = c.get('userId');
    const data = await deps.commands.clearCart(userId);
    return c.json(data);
  });

  return router;
}
