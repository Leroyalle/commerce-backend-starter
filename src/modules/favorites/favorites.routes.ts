import { createRoute, z } from '@hono/zod-openapi';

import { SECURITY_SCHEMES } from '@/shared/constants/security-schemes.constants';
import { favoritesSelectSchema } from '@/shared/infrastructure/db/schema/favorite.schema';

export const addFavoriteRoute = createRoute({
  summary: 'Добавить товар в избранное',
  tags: ['Favorites'],
  description: 'Добавляет товар в избранное',
  method: 'post',
  path: '/favorites',
  security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            productId: z.string(),
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
  path: '/favorites',
  security: [{ [SECURITY_SCHEMES.ACCESS_TOKEN_COOKIE]: [] }],
  responses: {
    200: {
      description: 'Возвращает список избранных товаров',
      content: {
        'application/json': {
          schema: favoritesSelectSchema.array(),
        },
      },
    },
  },
});
