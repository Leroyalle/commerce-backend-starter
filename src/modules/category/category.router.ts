import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { NotFoundException } from '@/shared/exceptions/exceptions';
import { categorySelectSchema } from '@/shared/infrastructure/db/schemes/category.schema';
import { paramsZodSchema } from '@/shared/infrastructure/zod/params.schema';
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
    tags: ['Categories'],
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
    tags: ['Categories'],
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

  const getByIdRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Categories'],
    summary: 'Получить категорию по id',
    description: 'Получить категорию по id',
    request: {
      params: paramsZodSchema,
    },
    responses: {
      200: {
        description: 'Возвращает категорию',
        content: {
          'application/json': {
            schema: categorySelectSchema,
          },
        },
      },
    },
  });

  router.openapi(getByIdRoute, async c => {
    const params = c.req.valid('param');
    const data = await deps.queries.getById(params.id);
    if (!data) throw NotFoundException.Category();
    return c.json(data, 200);
  });

  return router;
}
