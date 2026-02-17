import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { categorySelectSchema } from '@/shared/infrastructure/db/schema/category.schema';
import { AuthVars } from '@/shared/types/auth-variables.type';

import { ICategoryCommands } from './category.commands';
import { ICategoryQueries } from './category.queries';
import { createCategoryZodSchema } from './schemes/create-category.schema';

interface Deps {
  commands: ICategoryCommands;
  queries: ICategoryQueries;
}

export function createCategoryRouter(deps: Deps) {
  const router = new OpenAPIHono<{ Variables: AuthVars }>();

  const getAllRoute = createRoute({
    method: 'get',
    path: '/',
    summary: 'Получить все категории',
    description: 'Ищет все доступные категории',
    responses: {
      200: {
        description: 'Возвращает все категории',
        content: {
          'application/json': {
            schema: categorySelectSchema.array(),
          },
        },
      },
    },
  });

  router.openapi(getAllRoute, async c => {
    const result = await deps.queries.findAll();
    return c.json(result);
  });

  const createCategoryRoute = createRoute({
    method: 'post',
    path: '/',
    summary: 'Создает категорию',
    description: 'Создает категорию',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createCategoryZodSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Успешно созданная категория',
        content: { 'application/json': { schema: categorySelectSchema } },
      },
    },
  });

  // TODO: гвард админа
  router.openapi(createCategoryRoute, async c => {
    const body = c.req.valid('json');
    const result = await deps.commands.create(body);
    return c.json(result, 201);
  });

  return router;
}
