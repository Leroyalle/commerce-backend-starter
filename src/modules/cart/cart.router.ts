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
    const user = c.get('user');
    const data = await deps.queries.findByUserId(user.id);
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
      const user = c.get('user');
      const body = c.req.valid('json');
      const data = await deps.commands.addItem(user.id, body.productId, body.quantity);
      return c.json(data);
    },
  );

  router.delete(
    '/items/:id',
    deps.accessAuthMiddleware,
    zValidator('param', paramsZodSchema),
    async c => {
      const params = c.req.valid('param');
      const user = c.get('user');
      const data = await deps.commands.removeItem(user.id, params.id);
      return c.json(data);
    },
  );

  router.put(
    '/items/:id',
    deps.accessAuthMiddleware,
    zValidator('param', paramsZodSchema),
    async c => {
      const user = c.get('user');
      const params = c.req.valid('param');
      const data = await deps.commands.decrementItem(user.id, params.id);
      return c.json(data);
    },
  );

  router.delete('/', deps.accessAuthMiddleware, async c => {
    const user = c.get('user');
    const data = await deps.commands.clearCart(user.id);
    return c.json(data);
  });

  return router;
}
