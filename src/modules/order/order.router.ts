import { $, createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { MiddlewareHandler } from 'hono';

import { SECURITY_SCHEMES } from '@/shared/constants/security-schemes.constants';
import { orderSelectScheme } from '@/shared/infrastructure/db/schemes/order.schema';
import { AuthVars } from '@/shared/types/auth-variables.type';

import { OrderCommands } from './order.commands';
import { OrderQueries } from './order.queries';
import { createOrderZodSchema } from './schemas/create-order.schema';
import { successOrderCreation } from './schemas/success-order-creation.schema';

interface Deps {
  queries: OrderQueries;
  commands: OrderCommands;
  accessAuthMiddleware: MiddlewareHandler<{ Variables: AuthVars }>;
}

export function createOrderRouter(deps: Deps): OpenAPIHono<{ Variables: AuthVars }> {
  const router = new OpenAPIHono<{ Variables: AuthVars }>();

  const getOrdersRoute = createRoute({
    summary: 'Получить список заказов',
    security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
    tags: ['Orders'],
    description: 'Получить список заказов',
    method: 'get',
    path: '/',
    responses: {
      200: {
        description: 'Успешный ответ с данными заказов',
        content: {
          'application/json': {
            schema: orderSelectScheme.array(),
          },
        },
      },
    },
  });

  $(router).use(getOrdersRoute.path, deps.accessAuthMiddleware);
  router.openapi(getOrdersRoute, async c => {
    const user = c.get('user');
    const result = await deps.queries.findAllByUserId(user.id);
    return c.json(result);
  });

  const createOrderRoute = createRoute({
    description: 'Создать заказ',
    security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
    tags: ['Orders'],
    summary: 'Создает заказ',
    method: 'post',
    path: '/',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createOrderZodSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Успешное создание заказа',
        content: {
          'application/json': {
            schema: successOrderCreation,
          },
        },
      },
    },
  });

  $(router).use(createOrderRoute.path, deps.accessAuthMiddleware);
  router.openapi(createOrderRoute, async c => {
    const user = c.get('user');
    const body = c.req.valid('json');
    const result = await deps.commands.createOrder(user.id, body);
    return c.json(
      { success: result.success, message: 'Заказ успешно создан! Менеджер скоро свяжется с вами' },
      201,
    );
  });

  return router;
}
