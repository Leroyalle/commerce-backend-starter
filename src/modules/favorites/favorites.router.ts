import { $, OpenAPIHono } from '@hono/zod-openapi';
import type { MiddlewareHandler } from 'hono';

import { NotFoundException } from '@/shared/exceptions/exceptions';
import type { AuthVars } from '@/shared/types/auth-variables.type';

import type { IProductQueries } from '../product/product.queries';

import type { IFavoritesCommands } from './favorites.commands';
import type { IFavoritesQueries } from './favorites.queries';
import { addFavoriteRoute, findFavoritesRoute, removeFavoriteRoute } from './favorites.routes';
import type { IFavoritesService } from './favorites.service';

interface Deps {
  accessAuthMiddleware: MiddlewareHandler<{ Variables: AuthVars }>;
  favoritesCommands: IFavoritesCommands;
  favoritesQueries: IFavoritesQueries;
  favoritesService: IFavoritesService;
  productQueries: IProductQueries;
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

  $(router).use(findFavoritesRoute.path, deps.accessAuthMiddleware);
  router.openapi(findFavoritesRoute, async c => {
    const user = c.get('user');
    const favoriteIds = await deps.favoritesQueries.findAllByUserId(user.id);
    const products = await deps.productQueries.findByIds(favoriteIds);
    const result = deps.favoritesService.markIsFavorite(products);
    return c.json(result, 200);
  });

  $(router).use(removeFavoriteRoute.path, deps.accessAuthMiddleware);
  router.openapi(removeFavoriteRoute, async c => {
    const { productId } = c.req.valid('param');
    const user = c.get('user');
    const result = await deps.favoritesCommands.remove({ productId, userId: user.id });
    if (!result) throw NotFoundException.Favorite();
    return c.json(result, 201);
  });

  return router;
}
