import { $, createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { MiddlewareHandler } from 'hono';

import { SECURITY_SCHEMES } from '@/shared/constants/security-schemes.constants';
import { cartSelectSchema } from '@/shared/infrastructure/db/schemes/cart.schema';
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

export function createCartRouter(deps: Deps): OpenAPIHono<{ Variables: AuthVars }> {
  const router = new OpenAPIHono<{ Variables: AuthVars }>();

  const getCartRoute = createRoute({
    summary: 'Возвращает корзину пользователю',
    description: 'Возвращает корзину',
    tags: ['Cart'],
    method: 'get',
    security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
    path: '/',
    responses: {
      200: {
        description: 'Корзина найдена',
        content: {
          'application/json': {
            schema: cartSelectSchema,
          },
        },
      },
      404: {
        description: 'Корзина не найдена',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  $(router).use(getCartRoute.path, deps.accessAuthMiddleware);

  router.openapi(getCartRoute, async c => {
    const user = c.get('user');
    const data = await deps.queries.findByUserId(user.id);
    if (!data) {
      return c.json({ error: 'Cart not found' }, 404);
    }
    return c.json(data, 200);
  });

  const addItemRoute = createRoute({
    tags: ['Cart'],
    method: 'post',
    security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
    path: '/items',
    summary: 'Добавляет товар в корзину',
    description: 'Добавляет товар в корзину',
    request: {
      body: {
        content: {
          'application/json': {
            schema: addItemZodSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Успешное добавление в корзину',
        content: {
          'application/json': {
            schema: cartSelectSchema,
          },
        },
      },
    },
  });

  $(router).use(addItemRoute.path, deps.accessAuthMiddleware);

  router.openapi(addItemRoute, async c => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const data = await deps.commands.addItem(user.id, body.productId, body.quantity);
    return c.json(data, 201);
  });

  const deleteFromCartRoute = createRoute({
    method: 'delete',
    tags: ['Cart'],
    security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
    path: '/items/:id',
    summary: 'Удаляет товар из корзины',
    description: 'Удаляет товар из корзины',
    request: {
      params: paramsZodSchema,
    },
    responses: {
      201: {
        description: 'Успешное удаление из корзины',
        content: {
          'application/json': {
            schema: cartSelectSchema,
          },
        },
      },
    },
  });

  $(router).use(deleteFromCartRoute.path, deps.accessAuthMiddleware);

  router.openapi(deleteFromCartRoute, async c => {
    const params = c.req.valid('param');
    const user = c.get('user');
    const data = await deps.commands.removeItem(user.id, params.id);
    return c.json(data, 201);
  });

  const decreaseQuantityRoute = createRoute({
    method: 'put',
    tags: ['Cart'],
    security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
    path: '/items/:id',
    summary: 'Увеличивает количество товара в корзине',
    description: 'Увеличивает количество товара в корзине',
    request: {
      params: paramsZodSchema,
    },
    responses: {
      201: {
        description: 'Успешное увеличение количества',
        content: {
          'application/json': {
            schema: cartSelectSchema,
          },
        },
      },
    },
  });

  $(router).use(decreaseQuantityRoute.path, deps.accessAuthMiddleware);
  router.openapi(decreaseQuantityRoute, async c => {
    const user = c.get('user');
    const params = c.req.valid('param');
    const data = await deps.commands.decrementItem(user.id, params.id);
    return c.json(data);
  });

  const clearCartRoute = createRoute({
    method: 'delete',
    tags: ['Cart'],
    path: '/',
    summary: 'Очищает корзину',
    security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
    description: 'Очищает корзину',
    responses: {
      201: {
        description: 'Успешное очищение корзины',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
    },
  });

  $(router).use(clearCartRoute.path, deps.accessAuthMiddleware);
  router.openapi(clearCartRoute, async c => {
    const user = c.get('user');
    await deps.commands.clearCart(user.id);
    return c.json({ success: true, message: 'Корзина полностью очищена!' }, 201);
  });

  return router;
}
