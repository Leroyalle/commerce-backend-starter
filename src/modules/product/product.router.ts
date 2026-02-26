import { $, createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { MiddlewareHandler } from 'hono';
import { Index } from 'meilisearch';

import { Product, productSelectSchema } from '@/shared/infrastructure/db/schemes/product.schema';
import { paramsZodSchema } from '@/shared/infrastructure/zod/params.schema';
import type { AuthVars } from '@/shared/types/auth-variables.type';

import type { IFavoritesQueries } from '../favorites/favorites.queries';

import { ProductCommands } from './product.commands';
import { IProductQueries } from './product.queries';
import { createProductZodSchema } from './schemas/create-product.schema';
import { findProductsZodSchema } from './schemas/find-products.schema';

interface Deps {
  commands: ProductCommands;
  queries: IProductQueries;
  searchIndex: Index<Pick<Product, 'id' | 'name' | 'price'>>;
  favoritesQueries: IFavoritesQueries;
  optionalAccessGuard: MiddlewareHandler<{ Variables: Partial<AuthVars> }>;
}

export function createProductRouter(deps: Deps): OpenAPIHono<{ Variables: Partial<AuthVars> }> {
  const productRouter = new OpenAPIHono<{ Variables: Partial<AuthVars> }>();

  const getProductsRoute = createRoute({
    description: 'Получить список продуктов',
    summary: 'Получить список продуктов',
    method: 'get',
    tags: ['Products'],
    path: '/',
    request: {
      query: findProductsZodSchema,
    },
    responses: {
      200: {
        description: 'Успешный ответ с данными продуктов',
        content: {
          'application/json': {
            schema: z.object({
              items: productSelectSchema
                .pick({ id: true, name: true, price: true, image: true, details: true })
                .extend({
                  isFavorite: z.boolean(),
                })
                .array(),
              total: z.number(),
            }),
          },
        },
      },
    },
  });

  $(productRouter).use(getProductsRoute.path, deps.optionalAccessGuard);
  productRouter.openapi(getProductsRoute, async c => {
    const query = c.req.valid('query');
    const user = c.get('user');
    const userFavoriteIds = new Set(
      user ? await deps.favoritesQueries.findAllByUserId(user.id) : [],
    );
    const data = await deps.queries.findAll(query);
    const result = data.items.map(item => ({
      ...item,
      isFavorite: userFavoriteIds.has(item.id),
    }));
    return c.json({ items: result, total: data.total }, 200);
  });

  const createPostRoute = createRoute({
    description: 'Создать продукт',
    tags: ['Products'],
    summary: 'Создать продукт',
    method: 'post',
    path: '/',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createProductZodSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Успешный ответ с данными продукта',
        content: {
          'application/json': {
            schema: productSelectSchema,
          },
        },
      },
    },
  });

  // TODO: гвард на авторизацию админа
  productRouter.openapi(createPostRoute, async c => {
    const body = c.req.valid('json');
    const data = await deps.commands.create(body);
    return c.json(data, 201);
  });

  const getProductByIdRoute = createRoute({
    description: 'Получить продукт по id',
    summary: 'Получить продукт по id',
    tags: ['Products'],
    method: 'get',
    path: '/:id',
    request: {
      params: paramsZodSchema,
    },
    responses: {
      200: {
        description: 'Успешный ответ с данными продукта',
        content: {
          'application/json': {
            schema: productSelectSchema,
          },
        },
      },
    },
  });

  productRouter.openapi(getProductByIdRoute, async c => {
    const params = c.req.valid('param');
    const data = await deps.queries.findById(params.id);
    return c.json(data);
  });

  return productRouter;
}
