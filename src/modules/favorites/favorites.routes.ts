import { createRoute, z } from '@hono/zod-openapi';

import { SECURITY_SCHEMES } from '@/shared/constants/security-schemes.constants';
import { favoritesSelectSchema } from '@/shared/infrastructure/db/schemes/favorite.schema';
import { productSelectSchema } from '@/shared/infrastructure/db/schemes/product.schema';

export const addFavoriteRoute = createRoute({
  summary: 'Добавить товар в избранное',
  tags: ['Favorites'],
  description: 'Добавляет товар в избранное',
  method: 'post',
  path: '/',
  security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            productId: z.uuid(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Товар сохранен',
      content: {
        'application/json': {
          schema: favoritesSelectSchema,
        },
      },
    },
  },
});

export const findFavoritesRoute = createRoute({
  summary: 'Поиск избранных товаров',
  tags: ['Favorites'],
  description: 'Поиск избранных товаров',
  method: 'get',
  path: '/',
  security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
  responses: {
    200: {
      description: 'Возвращает список избранных товаров',
      content: {
        'application/json': {
          schema: productSelectSchema
            .extend({
              isFavorite: z.boolean(),
            })
            .array(),
        },
      },
    },
  },
});

export const removeFavoriteRoute = createRoute({
  summary: 'Удалить товар из избранного',
  tags: ['Favorites'],
  description: 'Удалить товар из избранного',
  method: 'delete',
  path: '/:productId',
  security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
  request: {
    params: z.object({
      productId: z.uuid(),
    }),
  },
  responses: {
    201: {
      description: 'Товар удален',
      content: {
        'application/json': {
          schema: favoritesSelectSchema,
        },
      },
    },
  },
});
