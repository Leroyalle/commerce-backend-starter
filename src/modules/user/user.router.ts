import { $, createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { MiddlewareHandler } from 'hono';

import { SECURITY_SCHEMES } from '@/shared/constants/security-schemes.constants';
import { NotFoundException } from '@/shared/exceptions/exceptions';
import { userSelectSchema } from '@/shared/infrastructure/db/schemes/user.schema';
import { paramsZodSchema } from '@/shared/infrastructure/zod/params.schema';
import { AuthVars } from '@/shared/types/auth-variables.type';

import { UserCommands } from './user.commands';
import { UserQueries } from './user.queries';

type CreateUserRouterDeps = {
  commands: UserCommands;
  queries: UserQueries;
  accessAuthMiddleware: MiddlewareHandler<{ Variables: AuthVars }>;
};

export function createUserRouter(deps: CreateUserRouterDeps): OpenAPIHono<{ Variables: AuthVars }> {
  const userRouter = new OpenAPIHono<{ Variables: AuthVars }>();

  const meRoute = createRoute({
    method: 'get',
    path: '/me',
    summary: 'Получить профиль',
    security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
    tags: ['Users'],
    description: 'Возвращает данные текущего авторизованного пользователя',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: userSelectSchema,
          },
        },
        description: 'Успешный ответ с данными пользователя',
      },
      404: { description: 'Пользователь не найден' },
    },
  });

  $(userRouter).use(meRoute.path, deps.accessAuthMiddleware);

  userRouter.openapi(meRoute, async c => {
    const user = c.get('user');
    const data = await deps.queries.findById(user.id);
    if (!data) throw NotFoundException.User();
    return c.json(data);
  });

  const byIdRoute = createRoute({
    method: 'get',
    tags: ['Users'],
    path: '/:id',
    summary: 'Получить профиль по айди',
    description: 'Возвращает данные пользователя',
    request: {
      params: paramsZodSchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: userSelectSchema,
          },
        },
        description: 'Успешный ответ с данными пользователя',
      },
      404: { description: 'Пользователь не найден' },
    },
  });

  userRouter.openapi(byIdRoute, async c => {
    const params = c.req.valid('param');
    const data = await deps.queries.findById(params.id);
    if (!data) throw NotFoundException.User();
    return c.json(data);
  });

  return userRouter;
}
