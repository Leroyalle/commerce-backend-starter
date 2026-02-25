import { $, OpenAPIHono } from '@hono/zod-openapi';
import type { MiddlewareHandler } from 'hono';

import type { AuthVars } from '@/shared/types/auth-variables.type';

import type { IFavoritesCommands } from './favorites.commands';
import type { IFavoritesQueries } from './favorites.queries';
import { addFavoriteRoute } from './favorites.routes';

interface Deps {
  accessAuthMiddleware: MiddlewareHandler<{ Variables: AuthVars }>;
  favoritesCommands: IFavoritesCommands;
  favoritesQueries: IFavoritesQueries;
}

export function createFavoritesRouter(deps: Deps) {
  const router = new OpenAPIHono<{ Variables: AuthVars }>();

  $(router).use(addFavoriteRoute.path, deps.accessAuthMiddleware);
  router.openapi(addFavoriteRoute, async c => {
    const { productId } = c.req.valid('json');
    const user = c.get('user');
    const result = await deps.favoritesCommands.add({ productId, userId: user.id });

    return c.json(result, 201);
  });

  return router;
}
